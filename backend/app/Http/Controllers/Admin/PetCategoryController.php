<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PetCategory;
use App\Models\PetVariety;
use App\Services\WebsiteMediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PetCategoryController extends Controller
{
    public function __construct(private readonly WebsiteMediaStorage $mediaStorage) {}

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $storedPaths = [];

        foreach (['cover_image' => 'cover_image_path', 'banner_image' => 'banner_image_path'] as $field => $column) {
            if ($request->hasFile($field)) {
                $path = $request->file($field)->store('website/categories', 'public');
                if (! $path) {
                    $this->deletePaths($storedPaths);

                    return response()->json(['message' => 'The category image could not be saved. Please try again.'], 500);
                }
                $storedPaths[] = $path;
                $data[$column] = $path;
            }
        }

        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['is_active'] = $request->boolean('is_active');
        unset($data['cover_image'], $data['banner_image']);

        try {
            $category = PetCategory::create($data);
        } catch (Throwable $error) {
            $this->deletePaths($storedPaths);
            throw $error;
        }

        return response()->json(['message' => 'Pet category added.', 'category' => $category], 201);
    }

    public function update(Request $request, PetCategory $category): JsonResponse
    {
        $data = $this->validated($request);
        $oldPaths = [];
        $newPaths = [];

        foreach (['cover_image' => 'cover_image_path', 'banner_image' => 'banner_image_path'] as $field => $column) {
            if (! $request->hasFile($field)) {
                continue;
            }

            $path = $request->file($field)->store('website/categories', 'public');
            if (! $path) {
                $this->deletePaths($newPaths);

                return response()->json(['message' => 'The category image could not be saved. Please try again.'], 500);
            }

            $newPaths[] = $path;
            if ($category->{$column}) {
                $oldPaths[] = $category->{$column};
            }
            $data[$column] = $path;
        }

        $data['slug'] = $this->uniqueSlug($data['title'], $category);
        $data['is_active'] = $request->boolean('is_active');
        unset($data['cover_image'], $data['banner_image']);

        try {
            $category->update($data);
        } catch (Throwable $error) {
            $this->deletePaths($newPaths);
            throw $error;
        }

        $this->mediaStorage->deleteIfUnreferenced($oldPaths);

        return response()->json(['message' => 'Pet category updated.', 'category' => $category->fresh()]);
    }

    public function destroy(PetCategory $category): JsonResponse
    {
        $paths = array_filter([
            $category->cover_image_path,
            $category->banner_image_path,
            ...$category->images->pluck('image_path')->all(),
            ...$category->varieties()->with('images')->get()->flatMap(
                fn (PetVariety $variety) => [$variety->image_path, ...$variety->images->pluck('image_path')->all()],
            )->all(),
        ]);

        DB::transaction(fn () => $category->delete());
        $this->mediaStorage->deleteIfUnreferenced($paths);

        return response()->json(['message' => 'Pet category and its varieties deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'detailed_description' => ['nullable', 'string', 'max:10000'],
            'display_order' => ['required', 'integer', 'min:0', 'max:10000'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'banner_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
    }

    private function uniqueSlug(string $value, ?PetCategory $category = null): string
    {
        $base = Str::slug($value) ?: Str::slug($category?->title ?? 'category');
        $slug = $base;
        $suffix = 2;

        while (PetCategory::query()
            ->where('slug', $slug)
            ->when($category, fn ($query) => $query->whereKeyNot($category->id))
            ->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private function deletePaths(array $paths): void
    {
        foreach (array_unique(array_filter($paths)) as $path) {
            Storage::disk('public')->delete($path);
        }
    }

}

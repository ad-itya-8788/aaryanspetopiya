<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PetCategory;
use App\Models\PetVariety;
use App\Models\PetVarietyImage;
use App\Services\WebsiteMediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class PetVarietyController extends Controller
{
    public function __construct(private readonly WebsiteMediaStorage $mediaStorage) {}

    public function index(PetCategory $category): JsonResponse
    {
        return response()->json([
            'category' => $category,
            'varieties' => $category->varieties()->with('images')->get(),
        ]);
    }

    public function store(Request $request, PetCategory $category): JsonResponse
    {
        $data = $this->validated($request, true);
        $storedPaths = [];
        $data = $this->storeImages($request, $data, $storedPaths);

        try {
            $variety = DB::transaction(function () use ($category, $data) {
                $additionalImages = $data['additional_images'] ?? [];
                unset($data['additional_images']);

                $variety = $category->varieties()->create($data);
                foreach ($additionalImages as $image) {
                    $variety->images()->create([
                        'image_path' => $image['path'],
                        'alt_text' => $image['alt_text'],
                    ]);
                }

                return $variety->load('images');
            });
        } catch (Throwable $error) {
            $this->deletePaths($storedPaths);
            throw $error;
        }

        return response()->json(['message' => 'Variety added.', 'variety' => $variety], 201);
    }

    public function update(Request $request, PetVariety $variety): JsonResponse
    {
        $data = $this->validated($request, false);
        $oldPath = $variety->image_path;
        $storedPaths = [];
        $data = $this->storeImages($request, $data, $storedPaths);
        $additionalImages = $data['additional_images'] ?? [];
        unset($data['additional_images']);

        try {
            $variety = DB::transaction(function () use ($variety, $data, $additionalImages) {
                $variety->update($data);
                foreach ($additionalImages as $image) {
                    $variety->images()->create([
                        'image_path' => $image['path'],
                        'alt_text' => $image['alt_text'],
                    ]);
                }

                return $variety->fresh()->load('images');
            });
        } catch (Throwable $error) {
            $this->deletePaths($storedPaths);
            throw $error;
        }

        if ($oldPath && $oldPath !== $variety->image_path) {
            $this->mediaStorage->deleteIfUnreferenced([$oldPath]);
        }

        return response()->json(['message' => 'Variety updated.', 'variety' => $variety]);
    }

    public function destroy(PetVariety $variety): JsonResponse
    {
        $paths = array_filter([
            $variety->image_path,
            ...$variety->images->pluck('image_path')->all(),
        ]);

        DB::transaction(fn () => $variety->delete());
        $this->mediaStorage->deleteIfUnreferenced($paths);

        return response()->json(['message' => 'Variety deleted.']);
    }

    public function destroyImage(PetVarietyImage $image): JsonResponse
    {
        $path = $image->image_path;
        $image->delete();
        $this->mediaStorage->deleteIfUnreferenced([$path]);

        return response()->json(['message' => 'Additional image deleted.']);
    }

    private function validated(Request $request, bool $requireImage): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'detailed_description' => ['nullable', 'string', 'max:10000'],
            'display_order' => ['required', 'integer', 'min:0', 'max:10000'],
            'is_active' => ['required', 'boolean'],
            'image' => [$requireImage ? 'required' : 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'additional_images' => ['nullable', 'array', 'max:10'],
            'additional_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);
    }

    private function storeImages(Request $request, array $data, array &$storedPaths): array
    {
        $name = $data['name'];
        $category = $request->route('category');
        $variety = $request->route('variety');
        $categoryId = $category instanceof PetCategory
            ? $category->id
            : ($variety instanceof PetVariety ? $variety->pet_category_id : 0);
        $data['slug'] = $this->uniqueSlug($name, (int) $categoryId, $variety instanceof PetVariety ? $variety : null);
        $data['is_active'] = $request->boolean('is_active');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('website/varieties', 'public');
            if (! $path) {
                throw ValidationException::withMessages(['image' => 'The variety image could not be saved. Please try again.']);
            }
            $data['image_path'] = $path;
            $storedPaths[] = $path;
        }

        $data['additional_images'] = [];

        foreach ($request->file('additional_images', []) as $image) {
            $path = $image->store('website/varieties', 'public');
            if (! $path) {
                $this->deletePaths($storedPaths);
                throw ValidationException::withMessages(['additional_images' => 'An additional image could not be saved. Please try again.']);
            }

            $storedPaths[] = $path;
            $data['additional_images'][] = [
                'path' => $path,
                'alt_text' => pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME),
            ];
        }

        unset($data['image']);

        return $data;
    }

    private function uniqueSlug(string $value, int $categoryId, ?PetVariety $variety = null): string
    {
        $base = Str::slug($value) ?: 'variety';
        $slug = $base;
        $suffix = 2;

        while (PetVariety::query()
            ->where('pet_category_id', $categoryId)
            ->where('slug', $slug)
            ->when($variety, fn ($query) => $query->whereKeyNot($variety->id))
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

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PetCategory;
use App\Models\WebsiteImage;
use App\Services\WebsiteMediaStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class WebsiteImageController extends Controller
{
    public function __construct(private readonly WebsiteMediaStorage $mediaStorage) {}

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, true);
        $this->validateDestination($data);
        $data['image_path'] = $request->file('image')->store('website', 'public');

        if (! $data['image_path']) {
            return response()->json(['message' => 'The image could not be saved. Please try again.'], 500);
        }

        $data['alt_text'] = $this->altText($data);
        $data['is_active'] = $request->boolean('is_active');
        unset($data['image']);
        WebsiteImage::create($data);

        return response()->json(['message' => 'Photo uploaded.'], 201);
    }

    public function update(Request $request, WebsiteImage $image): JsonResponse
    {
        $data = $this->validated($request, false);
        $this->validateDestination($data);
        $oldPath = $image->image_path;

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('website', 'public');

            if (! $data['image_path']) {
                return response()->json(['message' => 'The replacement image could not be saved. Please try again.'], 500);
            }
        }

        $data['alt_text'] = $this->altText($data);
        $data['is_active'] = $request->boolean('is_active');
        unset($data['image']);
        $image->update($data);

        if ($image->image_path !== $oldPath) {
            $this->mediaStorage->deleteIfUnreferenced([$oldPath]);
        }

        return response()->json(['message' => 'Photo settings updated.']);
    }

    public function destroy(WebsiteImage $image): JsonResponse
    {
        $path = $image->image_path;
        $image->delete();
        $this->mediaStorage->deleteIfUnreferenced([$path]);

        return response()->json(['message' => 'Photo deleted.']);
    }

    private function validated(Request $request, bool $requireImage): array
    {
        return $request->validate([
            'section_key' => ['nullable', 'string', 'in:hero,family,gallery'],
            'pet_category_id' => ['nullable', 'integer', 'exists:pet_categories,id'],
            'pet_name' => ['nullable', 'string', 'max:100'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'image' => [$requireImage ? 'required' : 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'display_order' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);
    }

    private function validateDestination(array $data): void
    {
        $sectionKey = $data['section_key'] ?? null;
        $hasCategory = ! empty($data['pet_category_id']);

        if (($sectionKey === null && ! $hasCategory) || (in_array($sectionKey, ['hero', 'family'], true) && $hasCategory)) {
            throw ValidationException::withMessages([
                'section_key' => 'Choose an Explore category, Pet Gallery, homepage hero, or family photo destination.',
            ]);
        }
    }

    private function altText(array $data): string
    {
        if (! empty($data['alt_text'])) {
            return $data['alt_text'];
        }

        if (! empty($data['pet_name'])) {
            return $data['pet_name'];
        }

        if (! empty($data['pet_category_id'])) {
            return PetCategory::query()->findOrFail($data['pet_category_id'])->title;
        }

        return match ($data['section_key'] ?? null) {
            'hero' => 'Happy pets at Aaryans Pet Paradise',
            'family' => 'A family spending time with their pet',
            default => 'Pet gallery photo',
        };
    }

}

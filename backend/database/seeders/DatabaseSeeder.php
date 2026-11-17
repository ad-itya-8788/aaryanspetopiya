<?php

namespace Database\Seeders;

use App\Models\PetCategory;
use App\Models\PetVariety;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        PetVariety::query()->delete();
        PetCategory::query()->delete();

        $categories = [
            [
                'title' => 'Dogs',
                'slug' => 'dogs',
                'short_description' => 'Our loyal companions with heart, courage and endless affection.',
                'detailed_description' => 'Dogs bring joy, warmth and companionship into every home. From gentle giants to playful explorers, every breed has a personality that makes life richer and more joyful.',
            ],
            [
                'title' => 'Birds',
                'slug' => 'birds',
                'short_description' => 'Colourful, intelligent and full of life in every flutter.',
                'detailed_description' => 'Birds captivate us with their vivid feathers, clever minds and expressive personalities. They remind us that beauty can be bright, social and wonderfully lively.',
            ],
            [
                'title' => 'Hamsters',
                'slug' => 'hamsters',
                'short_description' => 'Tiny creatures with curious habits and big personalities.',
                'detailed_description' => 'Hamsters may be small, but they are full of personality. Their playful energy, curiosity and adorable routines make them fascinating little companions.',
            ],
            [
                'title' => 'Hares',
                'slug' => 'hares',
                'short_description' => 'Nature’s speedsters, built for open ground and quick movement.',
                'detailed_description' => 'Hares are agile, alert and remarkable in the wild. Their long ears, powerful legs and quick instincts make them a fascinating part of nature’s story.',
            ],
            [
                'title' => 'Rabbits',
                'slug' => 'rabbits',
                'short_description' => 'Gentle, curious and endlessly adorable hoppers.',
                'detailed_description' => 'Rabbits are gentle animals loved for their soft fur, twitching noses and playful personalities. They enjoy exploring, resting and living in safe, caring environments.',
            ],
            [
                'title' => 'Horses',
                'slug' => 'horses',
                'short_description' => 'Power, beauty and elegance in motion.',
                'detailed_description' => 'Horses are symbols of grace, strength and partnership. Their athletic ability and gentle nature continue to inspire admiration in cultures around the world.',
            ],
            [
                'title' => 'Iguana',
                'slug' => 'iguana',
                'short_description' => 'The little dragon of nature, calm, curious and fascinating.',
                'detailed_description' => 'Iguanas are remarkable reptiles with scaly skin, strong tails and a prehistoric appearance. They bring curiosity and wonder to the world of exotic pets and wildlife lovers.',
            ],
        ];

        $categoryMap = [];
        foreach ($categories as $index => $category) {
            $category['display_order'] = $index + 1;
            $category['is_active'] = true;
            $categoryMap[$category['slug']] = PetCategory::create($category);
        }

        $varieties = [
            [
                'category' => 'dogs',
                'name' => 'Tibetan Mastiff',
                'slug' => 'tibetan-mastiff',
                'short_description' => 'The guardian giant of the Himalayan region.',
                'detailed_description' => "A majestic and powerful dog breed originating from the Himalayan region. Known for its thick coat, impressive size and naturally protective instincts, the Tibetan Mastiff is truly a giant with a commanding presence.\n\nDid You Know? Tibetan Mastiffs have a thick double coat that helps them survive the extremely cold temperatures of the Himalayan mountains!",
                'characteristics' => ['Powerful', 'Protective', 'Thick-coated'],
                'display_order' => 1,
            ],
            [
                'category' => 'dogs',
                'name' => 'Shih Tzu',
                'slug' => 'shih-tzu',
                'short_description' => 'A small, affectionate breed with royal charm.',
                'detailed_description' => "A small, adorable and affectionate breed known for its beautiful flowing coat and friendly personality. Shih Tzus were originally bred as companion dogs for Chinese royalty.\n\nDid You Know? The name Shih Tzu means 'Lion Dog' in Chinese!",
                'characteristics' => ['Affectionate', 'Royal companion', 'Friendly'],
                'display_order' => 2,
            ],
            [
                'category' => 'dogs',
                'name' => 'Great Dane',
                'slug' => 'great-dane',
                'short_description' => 'A gentle giant with elegance and warmth.',
                'detailed_description' => "One of the tallest dog breeds in the world, the Great Dane is admired for its enormous size, elegant appearance and gentle temperament. Despite looking intimidating, these dogs are often affectionate family companions.\n\nDid You Know? Great Danes can stand taller than many young children when standing on their hind legs!",
                'characteristics' => ['Tall', 'Gentle', 'Family-friendly'],
                'display_order' => 3,
            ],
            [
                'category' => 'dogs',
                'name' => 'Labrador Retriever',
                'slug' => 'labrador-retriever',
                'short_description' => 'Friendly, smart and built for adventures.',
                'detailed_description' => "Intelligent, playful and incredibly friendly, Labradors are among the world's most loved dog breeds. They are excellent swimmers and are often trained as guide, rescue and assistance dogs.\n\nDid You Know? Labradors have webbed feet that help them swim like natural little water athletes!",
                'characteristics' => ['Intelligent', 'Playful', 'Swimmer'],
                'display_order' => 4,
            ],
            [
                'category' => 'birds',
                'name' => 'Macaw',
                'slug' => 'macaw',
                'short_description' => 'The rainbow of the bird world.',
                'detailed_description' => "Macaws are large, colourful parrots famous for their brilliant feathers, strong curved beaks and playful personalities. They are highly intelligent and enjoy interacting with their surroundings.\n\nDid You Know? Macaws use their powerful beaks like an extra hand to climb branches and crack open hard nuts!",
                'characteristics' => ['Bright feathers', 'Highly intelligent', 'Playful'],
                'display_order' => 1,
            ],
            [
                'category' => 'birds',
                'name' => 'Galah Cockatoo',
                'slug' => 'galah-cockatoo',
                'short_description' => 'The pink charmer with a lively spirit.',
                'detailed_description' => "A beautiful Australian cockatoo recognised by its striking pink chest and grey wings. Galahs are social, playful and curious birds with lively personalities.\n\nDid You Know? Galahs can fly at impressive speeds and often travel together in large flocks!",
                'characteristics' => ['Social', 'Curious', 'Fast flyer'],
                'display_order' => 2,
            ],
            [
                'category' => 'birds',
                'name' => 'Lovebirds',
                'slug' => 'lovebirds',
                'short_description' => 'Small, colourful and deeply affectionate.',
                'detailed_description' => "Small, colourful and affectionate parrots known for their strong social bonds. Lovebirds are energetic, curious and love spending time with their companions.\n\nDid You Know? Lovebirds often groom each other's feathers as a way of showing affection and strengthening their bonds!",
                'characteristics' => ['Social', 'Curious', 'Affectionate'],
                'display_order' => 3,
            ],
            [
                'category' => 'birds',
                'name' => 'Sun Conure',
                'slug' => 'sun-conure',
                'short_description' => 'A little sunshine in motion.',
                'detailed_description' => "With brilliant shades of yellow, orange and green, Sun Conures look like flying sunshine! These cheerful parrots are playful, intelligent and full of energy.\n\nDid You Know? Sun Conures are known for their loud calls, which help them communicate with other birds!",
                'characteristics' => ['Vivid', 'Playful', 'Energetic'],
                'display_order' => 4,
            ],
            [
                'category' => 'birds',
                'name' => 'African Grey',
                'slug' => 'african-grey',
                'short_description' => 'Among the most intelligent talkers of the bird world.',
                'detailed_description' => "Considered among the most intelligent parrot species, African Greys are famous for their remarkable ability to imitate human speech, recognise sounds and learn associations.\n\nDid You Know? Some African Grey parrots can learn to identify colours, shapes and even quantities!",
                'characteristics' => ['Highly intelligent', 'Speech mimic', 'Observant'],
                'display_order' => 5,
            ],
            [
                'category' => 'birds',
                'name' => 'Yellow-Crested Cockatoo',
                'slug' => 'yellow-crested-cockatoo',
                'short_description' => 'The sunshine crown of the parrot world.',
                'detailed_description' => "A beautiful white cockatoo recognised by its striking yellow crest, which it can raise like a crown. These intelligent and social birds are known for their playful personalities, expressive behaviour and strong curved beaks.\n\nDid You Know? A Yellow-Crested Cockatoo can raise and lower its bright yellow crest to express excitement, curiosity or alarm!",
                'characteristics' => ['Expressive', 'Social', 'Playful'],
                'display_order' => 6,
            ],
            [
                'category' => 'birds',
                'name' => 'Sulphur-Crested Cockatoo',
                'slug' => 'sulphur-crested-cockatoo',
                'short_description' => 'A crowned performer with lively intelligence.',
                'detailed_description' => "A magnificent white parrot with a spectacular yellow crest, dark curved beak and expressive personality. Sulphur-Crested Cockatoos are highly intelligent, curious and famous for their loud calls and impressive problem-solving abilities.",
                'characteristics' => ['Curious', 'Intelligent', 'Expressive'],
                'display_order' => 7,
            ],
            [
                'category' => 'hamsters',
                'name' => 'Hamster',
                'slug' => 'hamster',
                'short_description' => 'Tiny paws, curious habits and a world of personality.',
                'detailed_description' => "Hamsters are adorable little rodents known for their fluffy bodies, tiny paws and curious nature. They love exploring, burrowing and collecting food. Although small, they are surprisingly active and independent.\n\nDid You Know? Hamsters have expandable cheek pouches that work like tiny shopping bags, allowing them to carry food back to their nests!",
                'characteristics' => ['Curious', 'Active', 'Independent'],
                'display_order' => 1,
            ],
            [
                'category' => 'hares',
                'name' => 'Hare',
                'slug' => 'hare',
                'short_description' => 'Built for speed and open landscapes.',
                'detailed_description' => "Hares are fascinating wild mammals recognised by their long ears, powerful hind legs and incredible running abilities. They are generally larger and faster than rabbits and are built for life in open grasslands.\n\nDid You Know? Some hare species can reach speeds of approximately 70 km/h, making them among the fastest small land mammals!",
                'characteristics' => ['Fast', 'Alert', 'Wild'],
                'display_order' => 1,
            ],
            [
                'category' => 'rabbits',
                'name' => 'Rabbit',
                'slug' => 'rabbit',
                'short_description' => 'A gentle hopper with soft fur and bright curiosity.',
                'detailed_description' => "Rabbits are gentle, intelligent and curious animals loved for their soft fur, twitching noses and adorable hopping movements. They enjoy exploring their surroundings and feeding on hay and leafy greens.\n\nDid You Know? A rabbit's teeth never stop growing throughout its life! Chewing hay helps naturally wear them down.",
                'characteristics' => ['Gentle', 'Curious', 'Quick-hopping'],
                'display_order' => 1,
            ],
            [
                'category' => 'horses',
                'name' => 'Thoroughbred',
                'slug' => 'thoroughbred',
                'short_description' => 'Born for speed and endurance.',
                'detailed_description' => "Thoroughbreds are renowned for their athletic build, speed and stamina. Originally developed in England, they are particularly famous for horse racing and competitive equestrian sports.\n\nDid You Know? Thoroughbreds can gallop at speeds exceeding 60 km/h!",
                'characteristics' => ['Athletic', 'Fast', 'Enduring'],
                'display_order' => 1,
            ],
            [
                'category' => 'horses',
                'name' => 'Kathiawari',
                'slug' => 'kathiawari',
                'short_description' => 'The pride of India with a distinctive look.',
                'detailed_description' => "Originating from the Kathiawar region of Gujarat, the Kathiawari is a distinctive Indian horse breed known for its endurance, alertness and unusual inward-curving ears.\n\nDid You Know? A Kathiawari horse's curved ears are so distinctive that their tips can sometimes touch or overlap!",
                'characteristics' => ['Enduring', 'Alert', 'Distinctive'],
                'display_order' => 2,
            ],
            [
                'category' => 'iguana',
                'name' => 'Iguana',
                'slug' => 'iguana',
                'short_description' => 'The little dragon of nature, calm and fascinating.',
                'detailed_description' => "Iguanas are fascinating reptiles known for their scaly skin, long tails and prehistoric appearance. Green Iguanas are primarily herbivores and enjoy climbing trees, basking in the sunshine and exploring their surroundings.\n\nDid You Know? Iguanas have a special light-sensitive structure on top of their heads called a parietal eye, often nicknamed their 'third eye'!",
                'characteristics' => ['Scaly', 'Climbing', 'Sun-loving'],
                'display_order' => 1,
            ],
        ];

        foreach ($varieties as $varietyData) {
            $category = $categoryMap[$varietyData['category']];

            $category->varieties()->create([
                'name' => $varietyData['name'],
                'slug' => Str::slug($varietyData['slug']),
                'short_description' => $varietyData['short_description'],
                'detailed_description' => $varietyData['detailed_description'],
                'characteristics' => $varietyData['characteristics'],
                'display_order' => $varietyData['display_order'],
                'is_active' => true,
            ]);
        }

        $this->call(AdminSeeder::class);
        $this->call(PetGamesSeeder::class);
    }
}

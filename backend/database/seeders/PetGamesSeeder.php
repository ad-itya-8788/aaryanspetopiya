<?php

namespace Database\Seeders;

use App\Models\PetGame;
use App\Models\PetGameQuestion;
use Illuminate\Database\Seeder;

class PetGamesSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            ['title' => 'Guess the Animal', 'slug' => 'guess-the-animal', 'description' => 'Look at the animal picture and pick the right name.', 'game_type' => 'guess_animal', 'difficulty' => 'Easy'],
            ['title' => 'Pet Knowledge Quiz', 'slug' => 'pet-knowledge-quiz', 'description' => 'Test what you know about pet care, animal habits and homes.', 'game_type' => 'quiz', 'difficulty' => 'Medium'],
            ['title' => 'Animal Crossword', 'slug' => 'animal-crossword', 'description' => 'Solve the animal clues, fill the letter boxes and use hints wisely.', 'game_type' => 'crossword', 'difficulty' => 'Medium'],
        ];
        $gameModels = [];

        foreach ($games as $data) {
            $gameModels[$data['slug']] = PetGame::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [...$data, 'is_active' => true],
            );
        }
        $retiredSoundGame = PetGame::query()->where('slug', 'guess-the-animal-sound')->first();
        if ($retiredSoundGame) {
            $retiredSoundGame->update(['is_active' => false]);
            $retiredSoundGame->questions()->update(['is_active' => false]);
        }

        // Retire older questions of these games (kept in the database, so old attempts stay safe).
        // Every question seeded below is switched back to active.
        PetGameQuestion::query()
            ->whereIn('pet_game_id', collect($gameModels)->pluck('id'))
            ->update(['is_active' => false]);

        $this->seedGuessAnimal($gameModels['guess-the-animal']);
        $this->seedQuiz($gameModels['pet-knowledge-quiz']);
        $this->seedCrossword($gameModels['animal-crossword']);
    }

    /** Game 1: 100 animals. Format: name|emoji|simple clue */
    private function seedGuessAnimal(PetGame $game): void
    {
        $rows = $this->lines(<<<'TXT'
Dog|🐶|A dog barks and wags its tail.
Cat|🐱|A cat purrs and says meow.
Mouse|🐭|A mouse is small and likes cheese.
Hamster|🐹|A hamster has round cheeks and runs on a wheel.
Rabbit|🐰|A rabbit hops and has long ears.
Fox|🦊|A fox has a bushy tail.
Bear|🐻|A bear is big and furry.
Panda|🐼|A panda is black and white and eats bamboo.
Koala|🐨|A koala sleeps in gum trees.
Tiger|🐯|A tiger is a big cat with stripes.
Lion|🦁|A lion has a big mane.
Cow|🐮|A cow gives us milk.
Pig|🐷|A pig says oink.
Frog|🐸|A frog jumps and croaks.
Monkey|🐵|A monkey climbs trees and eats bananas.
Hen|🐔|A hen lays eggs.
Penguin|🐧|A penguin cannot fly but loves to swim.
Duck|🦆|A duck quacks and swims.
Eagle|🦅|An eagle has sharp eyes and big wings.
Owl|🦉|An owl hoots at night.
Bat|🦇|A bat flies at night.
Wolf|🐺|A wolf howls at the moon.
Wild boar|🐗|A wild boar is a wild pig with tusks.
Horse|🐴|A horse can run fast and be ridden.
Bee|🐝|A bee makes honey.
Butterfly|🦋|A butterfly has colourful wings.
Snail|🐌|A snail is slow and has a shell.
Ladybird|🐞|A ladybird is red with black dots.
Ant|🐜|An ant is tiny and works hard.
Spider|🕷️|A spider spins a web.
Scorpion|🦂|A scorpion has a stinging tail.
Turtle|🐢|A turtle carries its shell on its back.
Snake|🐍|A snake is long and has no legs.
Lizard|🦎|A lizard has four legs and a long tail.
Octopus|🐙|An octopus has eight arms.
Squid|🦑|A squid lives in the sea and has long arms.
Shrimp|🦐|A shrimp is a small sea animal.
Lobster|🦞|A lobster has big claws.
Crab|🦀|A crab walks sideways.
Pufferfish|🐡|A pufferfish puffs up like a ball.
Tropical fish|🐠|A tropical fish has bright colours.
Fish|🐟|A fish swims with its fins.
Dolphin|🐬|A dolphin is a smart sea animal.
Whale|🐳|A whale is the biggest animal in the sea.
Shark|🦈|A shark has sharp teeth.
Crocodile|🐊|A crocodile has strong jaws.
Leopard|🐆|A leopard has spots on its fur.
Zebra|🦓|A zebra has black and white stripes.
Gorilla|🦍|A gorilla is a big, strong ape.
Orangutan|🦧|An orangutan has long orange hair.
Elephant|🐘|An elephant has a long trunk.
Hippo|🦛|A hippo loves water and mud.
Rhino|🦏|A rhino has a horn on its nose.
Camel|🐪|A camel has one hump.
Two-hump camel|🐫|This camel has two humps on its back.
Giraffe|🦒|A giraffe has a very long neck.
Kangaroo|🦘|A kangaroo hops and has a pouch.
Buffalo|🐃|A buffalo is a big, strong animal with horns.
Ox|🐂|An ox is a strong farm animal.
Ram|🐏|A ram is a male sheep with curved horns.
Sheep|🐑|A sheep gives us wool.
Llama|🦙|A llama has a long neck and soft wool.
Goat|🐐|A goat likes to climb.
Deer|🦌|A deer has antlers.
Poodle|🐩|A poodle is a dog with curly fur.
Rooster|🐓|A rooster crows in the morning.
Turkey|🦃|A turkey says gobble gobble.
Peacock|🦚|A peacock has a big colourful tail.
Parrot|🦜|A parrot can copy words.
Swan|🦢|A swan is a graceful white bird.
Flamingo|🦩|A flamingo is pink and stands on one leg.
Dove|🕊️|A dove is a white bird of peace.
Raccoon|🦝|A raccoon has a mask on its face.
Skunk|🦨|A skunk has a very strong smell.
Badger|🦡|A badger digs and has a striped face.
Beaver|🦫|A beaver builds dams.
Otter|🦦|An otter loves to play in water.
Sloth|🦥|A sloth moves very slowly.
Squirrel|🐿️|A squirrel loves nuts and has a bushy tail.
Hedgehog|🦔|A hedgehog has sharp spines.
Seal|🦭|A seal swims and eats fish.
Beetle|🪲|A beetle has a hard shell on its back.
Fly|🪰|A fly has two wings and buzzes.
Worm|🪱|A worm lives in the soil.
Bison|🦬|A bison is a big, shaggy animal.
Goose|🪿|A goose honks.
Crow|🐦‍⬛|A crow is a black bird.
Chick|🐤|A chick is a baby hen.
Mosquito|🦟|A mosquito is a tiny flying insect.
Cricket|🦗|A cricket chirps at night.
Rat|🐀|A rat is a small animal with a long tail.
Jellyfish|🪼|A jellyfish floats in the sea.
Caterpillar|🐛|A caterpillar becomes a butterfly.
Bird|🐦|A bird has feathers and wings.
Mammoth|🦣|A mammoth was a big hairy elephant that lived long ago.
Dodo|🦤|A dodo was a bird that could not fly. It lived long ago.
Dinosaur|🦕|This long-necked dinosaur lived long ago.
T-Rex|🦖|A T-Rex was a big dinosaur with sharp teeth.
Moose|🫎|A moose is a very big deer with wide antlers.
Donkey|🫏|A donkey has long ears and says hee-haw.
TXT);

        $names = array_column($rows, 0);

        foreach ($rows as $index => [$animal, $emoji, $clue]) {
            $this->question($game, [
                'question' => 'Which animal is shown?',
                'image_or_audio' => 'emoji:'.$emoji,
                'correct_answer' => $animal,
                'wrong_options' => $this->wrongOptions($names, $index),
                'explanation' => $clue,
            ]);
        }
    }

    /** Game 2: 100 quiz questions. Format: question|right answer|wrong 1|wrong 2|wrong 3|explanation */
    private function seedQuiz(PetGame $game): void
    {
        $rows = $this->lines(<<<'TXT'
Which animal says "meow"?|Cat|Dog|Cow|Duck|Cats say meow.
What should a pet always have to drink?|Clean water|Soda|Tea|Cold coffee|Clean water keeps pets healthy.
Which food is bad for dogs?|Chocolate|Rice|Chicken|Carrot|Chocolate can make dogs very sick.
Where does a fish live?|In water|On a tree|In a nest|In the sky|Fish live and breathe in water.
What do rabbits like to eat?|Hay and greens|Chocolate|Pizza|Ice cream|Hay is good for rabbits.
How often should you feed a pet?|At regular times|Never|Once a month|Only when you remember|Pets need meals at regular times.
Who is the doctor for animals?|Vet|Teacher|Pilot|Cook|A vet takes care of sick animals.
What should you do if a pet is sick?|Take it to a vet|Ignore it|Give it candy|Shout at it|A vet can help it get well.
Which pet can fly?|Parrot|Dog|Rabbit|Hamster|A parrot is a bird, so it can fly.
What does a hen give us?|Eggs|Milk|Wool|Honey|Hens lay eggs.
What does a cow give us?|Milk|Eggs|Wool|Silk|Cows give us milk.
What does a sheep give us?|Wool|Milk|Eggs|Honey|Sheep give us wool.
What do bees make?|Honey|Milk|Butter|Eggs|Bees make honey in their hive.
Where does a bird make its home?|In a nest|In a burrow|In a pond|In a cave|Birds build nests.
What is a baby dog called?|Puppy|Kitten|Calf|Lamb|A baby dog is a puppy.
What is a baby cat called?|Kitten|Puppy|Chick|Foal|A baby cat is a kitten.
What is a baby cow called?|Calf|Lamb|Foal|Kid|A baby cow is a calf.
What is a baby sheep called?|Lamb|Calf|Puppy|Chick|A baby sheep is a lamb.
What is a baby horse called?|Foal|Kid|Cub|Piglet|A baby horse is a foal.
What is a baby goat called?|Kid|Calf|Foal|Cub|A baby goat is a kid.
What is a baby frog called?|Tadpole|Chick|Puppy|Lamb|A baby frog is a tadpole.
Which animal likes to eat carrots?|Rabbit|Lion|Shark|Eagle|Rabbits love carrots.
Which animal is the biggest on land?|Elephant|Dog|Cat|Horse|The elephant is the biggest land animal.
Which animal is the tallest?|Giraffe|Horse|Camel|Bear|A giraffe has a very long neck.
Which animal has a hump?|Camel|Horse|Cow|Pig|A camel stores fat in its hump.
Which animal can live in the desert?|Camel|Penguin|Fish|Frog|Camels can go many days without water.
Which animal lives in very cold places?|Penguin|Parrot|Monkey|Camel|Penguins live in cold places.
Where do monkeys like to live?|In trees|In ponds|In deserts|On ice|Monkeys climb trees.
What does a dog do when it is happy?|Wags its tail|Hides|Flies|Sleeps in water|A wagging tail often shows a happy dog.
What does a cat do when it is happy?|Purrs|Barks|Roars|Quacks|Cats purr when they are happy.
How should you pick up a small puppy?|Hold it gently with two hands|Pull its tail|Hold its ears|Throw it|Always be gentle with pets.
Should you pull a pet's tail?|No, never|Yes, always|Yes, for fun|Only on Sundays|Pulling a tail hurts animals.
What should you do before touching a strange dog?|Ask the owner|Run at it|Shout at it|Pull its tail|Always ask first.
If a dog growls, what should you do?|Stay calm and walk away slowly|Hit it|Scream and run|Pull its tail|Move away calmly.
What should you do after touching a pet?|Wash your hands|Jump|Do nothing|Close your eyes|Washing keeps you clean and safe.
Where should a pet bird's cage be kept?|In a safe, quiet place|In heavy rain|Near a hot stove|In a freezer|Birds need a calm, safe place.
Which is a good home for a goldfish?|A clean fish tank|A small cup|A cooking pot|A box|Goldfish need a clean tank.
What do hamsters like to run on?|A wheel|A bed|A plate|A chair|A wheel helps hamsters exercise.
When are hamsters most active?|At night|At noon|At breakfast|Never|Hamsters are active at night.
Which animal sleeps hanging upside down?|Bat|Dog|Cow|Rabbit|Bats hang upside down to sleep.
Which animal gives us wool?|Sheep|Cow|Hen|Dog|Sheep wool makes warm clothes.
Which animal is called the king of the jungle?|Lion|Rabbit|Cat|Dog|The lion is called the king of the jungle.
Which animal has black and white stripes?|Zebra|Lion|Horse|Cow|Zebras have stripes.
Which animal has a long trunk?|Elephant|Horse|Camel|Dog|Elephants use their trunks to eat and drink.
Which bird cannot fly?|Penguin|Parrot|Crow|Eagle|Penguins swim instead of flying.
Which animal lays eggs?|Duck|Dog|Cat|Cow|Ducks lay eggs.
Which animal can swim and quack?|Duck|Dog|Cat|Horse|Ducks quack and swim.
Which animal hops and croaks?|Frog|Snake|Fish|Snail|Frogs hop and croak.
Which animal is very slow?|Snail|Horse|Dog|Cheetah|Snails move slowly.
Which animal is very fast?|Cheetah|Snail|Turtle|Sloth|A cheetah is the fastest animal on land.
What can you give a pet dog to chew?|A safe chew toy|A shoe|A stone|A plastic bag|Safe toys protect a dog's teeth.
Why do dogs need walks?|For exercise|To get wet|To be sad|To sleep|Walks keep dogs fit and happy.
Where should a pet sleep?|In a soft, clean bed|In the road|In the rain|In a hot car|Pets need a cosy place to rest.
Is it safe to leave a pet in a hot car?|No, never|Yes, always|Yes, for a whole day|Yes, with music|Cars get dangerously hot.
What should you do if you find a lost pet?|Tell an adult|Keep it a secret|Run away|Chase it|An adult can help find its home.
Who should help you with a big dog?|An adult|A baby|No one|A stranger|Always ask an adult for help.
What do pets need to stay healthy?|Food, water and love|Only candy|Only toys|Nothing|Good care keeps pets healthy.
How should you speak to a pet?|Softly and kindly|Loudly and angrily|By shouting|By throwing things|Pets like gentle voices.
What does a vaccine do for pets?|Helps stop diseases|Makes them fly|Makes them tall|Makes them sleep forever|Vaccines protect pets from diseases.
How often should a pet see a vet?|At least once a year|Never|Every ten years|Only on holidays|Check-ups keep pets well.
What do cats use to clean themselves?|Their tongue|A towel|A stick|A hose|Cats lick their fur to stay clean.
What do cats like to scratch?|A scratching post|A baby|A book|A cup|A scratching post is the right place to scratch.
What are the long hairs on a cat's face called?|Whiskers|Feathers|Wool|Scales|Whiskers help cats feel things around them.
What covers a fish's body?|Scales|Feathers|Wool|Fur|Fish have scales.
What covers a bird's body?|Feathers|Scales|Wool|A shell|Birds have feathers.
What covers a turtle's back?|A shell|Fur|Feathers|Wool|A shell protects a turtle.
What do fish use to swim?|Fins|Wings|Legs|Horns|Fins help fish swim.
What do fish use to breathe?|Gills|A nose|Wings|Ears|Gills take air from the water.
Which pet needs a fish tank?|Goldfish|Dog|Cat|Parrot|Goldfish live in water.
Which animal makes a web?|Spider|Bee|Ant|Bat|Spiders spin webs.
What does a caterpillar turn into?|A butterfly|A frog|A bird|A bee|Caterpillars become butterflies.
Which animal has a pouch for its baby?|Kangaroo|Horse|Cow|Dog|Kangaroos carry babies in pouches.
Which animal eats bamboo?|Panda|Lion|Dog|Eagle|Pandas love bamboo.
Which animal sleeps through the winter?|Bear|Horse|Duck|Dog|Many bears rest all winter.
Which animal says "moo"?|Cow|Cat|Hen|Dog|Cows say moo.
Which animal says "oink"?|Pig|Duck|Cat|Sheep|Pigs say oink.
Which animal says "baa"?|Sheep|Dog|Cat|Hen|Sheep say baa.
Which animal says "quack"?|Duck|Pig|Cow|Horse|Ducks say quack.
Which animal says "neigh"?|Horse|Cat|Duck|Hen|Horses say neigh.
Which animal says "woof"?|Dog|Cat|Cow|Goat|Dogs bark or say woof.
Which small animal is famous for liking cheese?|Mouse|Lion|Cow|Horse|Mice are famous for cheese in stories.
Where does a wild rabbit sleep?|In a burrow|In a nest|In a pond|In a tree|Wild rabbits live in burrows.
Where do ducks like to play?|In water|On ice|In a tree|In a cave|Ducks love ponds.
Where does a lion live?|In grassland|In the ocean|On ice|In a pond|Lions live in grasslands.
Where does a polar bear live?|In snowy places|In a desert|In a jungle|On a farm|Polar bears live in cold places.
Where does a frog lay its eggs?|In water|On a tree|In a nest|In the sun|Frogs lay eggs in water.
Which animal lives in the sea?|Dolphin|Cow|Dog|Cat|Dolphins live in the sea.
Which animal is the biggest in the sea?|Whale|Crab|Dolphin|Goldfish|The blue whale is the biggest animal.
What should you do with pet waste outside?|Clean it up|Leave it|Hide it|Throw it at someone|Clean places stay safe for everyone.
What should you not give a pet?|Food from the table all the time|Clean water|A soft bed|A toy|Some human food can make pets sick.
Which of these is a farm animal?|Cow|Lion|Tiger|Shark|Cows live on farms.
Which of these is a wild animal?|Tiger|Cow|Hen|Sheep|Tigers live in the wild.
Which of these is a common pet?|Dog|Tiger|Shark|Wolf|Dogs are common pets.
Why should you be kind to animals?|They have feelings|They cannot see|They are toys|They are not alive|Animals feel happy and sad too.
What does a pet need to stay clean?|A bath sometimes|Mud every day|Soda|Sand|Regular care keeps pets clean.
What should be in a dog's bowl?|Fresh water|Chocolate|Soda|Mud|Fresh water every day is best.
What should you do if a pet runs away?|Tell an adult quickly|Wait for a year|Do nothing|Laugh|Quick action helps find the pet.
Which pet needs a litter box?|Cat|Fish|Parrot|Turtle|Cats use a litter box.
What do we call a dog's house?|Kennel|Nest|Pond|Hive|A kennel is a house for a dog.
Why do we love pets?|They are friendly companions|They do homework|They cook food|They drive cars|Pets keep us company.
TXT);

        foreach ($rows as [$question, $answer, $w1, $w2, $w3, $explanation]) {
            $this->question($game, [
                'question' => $question,
                'correct_answer' => $answer,
                'wrong_options' => [$w1, $w2, $w3],
                'explanation' => $explanation,
            ]);
        }
    }

    /** Game 3: 100 crossword words. Format: clue|ANSWER (hint is built automatically) */
    private function seedCrossword(PetGame $game): void
    {
        $rows = $this->lines(<<<'TXT'
A pet that barks|DOG
A pet that says meow|CAT
It gives us milk|COW
It lays eggs|HEN
It says oink|PIG
It says quack and swims|DUCK
A farm animal with horns that likes to climb|GOAT
It gives us wool|SHEEP
You can ride this animal|HORSE
It says hee-haw|DONKEY
It hops and likes carrots|RABBIT
A small pet with round cheeks|HAMSTER
A bird that can talk|PARROT
It carries a shell on its back|TURTLE
It lives in water and has fins|FISH
King of the jungle|LION
A big cat with stripes|TIGER
The biggest land animal|ELEPHANT
It loves bananas|MONKEY
A horse-like animal with black and white stripes|ZEBRA
The tallest animal|GIRAFFE
A big furry animal that sleeps in winter|BEAR
A black and white bear that eats bamboo|PANDA
It sleeps a lot in gum trees|KOALA
A clever animal with a bushy tail|FOX
It howls at the moon|WOLF
It has antlers|DEER
A bird that hoots at night|OWL
A big bird with sharp eyes|EAGLE
It flies at night and sleeps upside down|BAT
It makes honey|BEE
A tiny worker insect|ANT
It makes a web|SPIDER
A long animal that hisses|SNAKE
It jumps and croaks|FROG
A black bird that says caw|CROW
A white bird that is a sign of peace|DOVE
A bird that cannot fly and lives in the cold|PENGUIN
A smart sea animal that jumps|DOLPHIN
The biggest animal in the sea|WHALE
A sea animal with sharp teeth|SHARK
It walks sideways|CRAB
A slow animal with a shell|SNAIL
It lives in the desert and has a hump|CAMEL
It hops and carries its baby in a pouch|KANGAROO
A tiny animal that likes cheese|MOUSE
A baby dog|PUPPY
A baby cat|KITTEN
A baby cow|CALF
A baby sheep|LAMB
A baby horse|FOAL
A baby hen|CHICK
A baby duck|DUCKLING
A baby pig|PIGLET
A baby goat|KID
An insect with colourful wings|BUTTERFLY
It becomes a butterfly later|CATERPILLAR
A baby frog|TADPOLE
A bird's home|NEST
A home for a dog|KENNEL
A home for a horse|STABLE
A farm building for animals|BARN
A safe home for a pet bird|CAGE
A glass home for fish|TANK
You hold it when you walk a dog|LEASH
It goes around a dog's neck|COLLAR
You put pet food or water in it|BOWL
A dog loves to chew this|BONE
Dry grass that rabbits eat|HAY
Many pet birds eat these|SEEDS
Every pet needs fresh ___ to drink|WATER
A doctor for animals|VET
Dogs need this every day for exercise|WALK
A cat's or dog's foot|PAW
A dog wags this|TAIL
Soft hair on an animal|FUR
A bird uses this to fly|WING
A bird's mouth|BEAK
A bird's body is covered with these|FEATHER
A horse's foot|HOOF
A goat has this on its head|HORN
A turtle's hard cover|SHELL
A fish uses this to swim|FIN
Fish use these to breathe|GILLS
It comes from sheep|WOOL
A cow gives us this|MILK
A hen lays this|EGG
Bees make this|HONEY
An elephant's long nose|TRUNK
The long hair on a lion's neck|MANE
A tiger and a zebra have these|STRIPES
A camel has this on its back|HUMP
A kangaroo carries its baby in this|POUCH
A sharp nail on a cat|CLAW
Long hairs on a cat's face|WHISKERS
The sound a dog makes|BARK
The sound a cat makes|MEOW
The sound a duck makes|QUACK
The sound a lion makes|ROAR
A happy cat makes this soft sound|PURR
TXT);

        foreach ($rows as [$clue, $answer]) {
            $hint = 'It starts with '.$answer[0].' and has '.strlen($answer).' letters.';
            $this->question($game, [
                'question' => $clue,
                'correct_answer' => $answer,
                'wrong_options' => ['hint' => $hint],
                'explanation' => 'The answer is '.$answer.'.',
            ]);
        }
    }

    /** Game 4: 100 animal sounds. Format: animal|sound */
    private function seedSounds(PetGame $game): void
    {
        $rows = $this->lines(<<<'TXT'
Dog|Woof woof
Cat|Meow
Cow|Moo
Duck|Quack quack
Sheep|Baa baa
Horse|Neigh
Pig|Oink oink
Rooster|Cock-a-doodle-doo
Hen|Cluck cluck
Lion|Roar
Tiger|Grrr
Elephant|Trumpet
Monkey|Ooh ooh aah aah
Owl|Hoo hoo
Frog|Ribbit ribbit
Bee|Bzzz
Snake|Hissss
Wolf|Awooo
Donkey|Hee-haw
Goat|Meh meh
Parrot|Squawk
Crow|Caw caw
Pigeon|Coo coo
Cricket|Chirp chirp
Mouse|Squeak squeak
Bear|Growl
Turkey|Gobble gobble
Dolphin|Click click whistle
Peacock|Pee-ow pee-ow
Seal|Arf arf
Chick|Cheep cheep
Goose|Honk honk
Mosquito|Eeeee
Fly|Zzzzt
Bat|High squeak
Hyena|Hee hee laugh
Cuckoo|Cuckoo cuckoo
Sparrow|Tweet tweet
Canary|La la tweet
Guinea pig|Wheek wheek
Camel|Grunt and groan
Kangaroo|Cough and grunt
Rabbit|Thump thump
Hamster|Tiny eek
Hedgehog|Snuffle snuffle
Squirrel|Chuck chuck
Raccoon|Chitter chitter
Whale|Long moaning song
Gorilla|Boom boom chest drum
Cheetah|Chirp like a bird
Leopard|Rasping cough
Fox|Yap and scream
Coyote|Yip yip howl
Seagull|Kee-aw kee-aw
Eagle|Screech kee-kee
Hawk|Kree kree
Crane|Garoo garoo
Woodpecker|Tap tap tap
Nightingale|Sweet tweedle dee
Magpie|Chatter chatter
Raven|Croak croak
Rhino|Snort snort
Hippo|Wheeze honk
Giraffe|Soft hum
Buffalo|Low hrrrm
Deer|Snort and bleat
Moose|Deep booo
Llama|Hum hum
Ram|Deep maaah
Lamb|Maa-aa
Calf|Little mmaa
Kitten|Mew mew
Puppy|Yip yap
Foal|Whinny whinny
Piglet|Squeal squeal
Chipmunk|Chip chip
Otter|Chirp and whistle
Sloth|Ai ai
Koala|Grunt and burp
Panda|Beh beh
Penguin|Aaww aaww
Flamingo|Gah gah
Loon|Oooo-ooo wail
Rat|Eek squeal
Jaguar|Deep cough roar
Zebra|Bark and bray
Chimpanzee|Hoot and pant
Orangutan|Long groan call
Alligator|Loud bellow
Crocodile|Deep grunt
Quail|Bob-white whistle
Swan|Whoop whoop
Bull|Loud snort
Blackbird|Sweet whistle song
Robin|Cheerful chirrup
Duckling|Peep peep
Gecko|Geck-oh geck-oh
Cicada|Loud drone
Grasshopper|Zrrr zrrr
Beaver|Tail slap splash
TXT);

        $names = array_column($rows, 0);

        foreach ($rows as $index => [$animal, $sound]) {
            $this->question($game, [
                'question' => 'Which animal says "'.$sound.'"?',
                'correct_answer' => $animal,
                'wrong_options' => $this->wrongOptions($names, $index),
                'explanation' => 'A '.strtolower($animal).' says "'.$sound.'". You can add an audio clip later under frontend/public/audio.',
            ]);
        }
    }

    /** Parse "a|b|c" lines into arrays. */
    private function lines(string $text): array
    {
        $lines = array_values(array_filter(array_map('trim', explode("\n", $text))));

        return array_map(fn (string $line) => array_map('trim', explode('|', $line)), $lines);
    }

    /** Pick 3 different wrong answers from the list, in a fixed (repeatable) pattern. */
    private function wrongOptions(array $names, int $index): array
    {
        $count = count($names);

        return array_map(fn (int $step) => $names[($index + $step) % $count], [7, 23, 41]);
    }

    private function question(PetGame $game, array $data): void
    {
        // The key includes the correct answer, so questions with the same text
        // (like "Which animal is shown?") are saved as separate rows.
        PetGameQuestion::query()->updateOrCreate(
            [
                'pet_game_id' => $game->id,
                'question' => $data['question'],
                'correct_answer' => $data['correct_answer'],
            ],
            [
                'image_or_audio' => $data['image_or_audio'] ?? null,
                'wrong_options' => $data['wrong_options'] ?? [],
                'explanation' => $data['explanation'] ?? null,
                'is_active' => true,
            ],
        );
    }
}
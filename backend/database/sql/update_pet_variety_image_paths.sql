-- MySQL/MariaDB. Match each existing variety by its category and stable slug.
-- Only image_path is changed; no animal records are inserted or deleted.
START TRANSACTION;

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/tibetan-mastiff.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'dogs')
  AND `slug` = 'tibetan-mastiff';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/shih-tzu.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'dogs')
  AND `slug` = 'shih-tzu';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/great-dane.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'dogs')
  AND `slug` = 'great-dane';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/labrador-retriever.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'dogs')
  AND `slug` = 'labrador-retriever';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/macaw.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'macaw';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/galah-cockatoo.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'galah-cockatoo';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/lovebirds.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'lovebirds';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/sun-conure.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'sun-conure';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/african-grey.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'african-grey';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/yellow-crested-cockatoo.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'yellow-crested-cockatoo';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/sulphur-crested-cockatoo.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'birds')
  AND `slug` = 'sulphur-crested-cockatoo';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/hamster.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'hamsters')
  AND `slug` = 'hamster';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/hare.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'hares')
  AND `slug` = 'hare';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/rabbit.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'rabbits')
  AND `slug` = 'rabbit';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/thoroughbred.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'horses')
  AND `slug` = 'thoroughbred';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/kathiawari.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'horses')
  AND `slug` = 'kathiawari';

UPDATE `pet_varieties`
SET `image_path` = 'website/varieties/iguana.jpg'
WHERE `pet_category_id` = (SELECT `id` FROM `pet_categories` WHERE `slug` = 'iguana')
  AND `slug` = 'iguana';

COMMIT;

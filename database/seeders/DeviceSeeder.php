<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Device;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Apple', 'sort_order' => 1],
            ['name' => 'Samsung', 'sort_order' => 2],
            ['name' => 'Google', 'sort_order' => 3],
            ['name' => 'Huawei', 'sort_order' => 4],
            ['name' => 'Oppo', 'sort_order' => 5],
            ['name' => 'Xiaomi', 'sort_order' => 6],
            ['name' => 'Sony', 'sort_order' => 7],
            ['name' => 'Motorola', 'sort_order' => 8],
            ['name' => 'OnePlus', 'sort_order' => 9],
            ['name' => 'Fairphone', 'sort_order' => 10],
            ['name' => 'Nothing', 'sort_order' => 11],
            ['name' => 'Nokia', 'sort_order' => 12],
            ['name' => 'Asus', 'sort_order' => 13],
            ['name' => 'Realme', 'sort_order' => 14],
            ['name' => 'Honor', 'sort_order' => 15],
            ['name' => 'Vivo', 'sort_order' => 16],
            ['name' => 'Microsoft', 'sort_order' => 17],
            ['name' => 'Lenovo', 'sort_order' => 18],
            ['name' => 'Dell', 'sort_order' => 19],
            ['name' => 'HP', 'sort_order' => 20],
            ['name' => 'Acer', 'sort_order' => 21],
            ['name' => 'Sharp', 'sort_order' => 22],
            ['name' => 'Rakuten', 'sort_order' => 23],
            ['name' => 'ZTE', 'sort_order' => 24],
            ['name' => 'Nubia', 'sort_order' => 25],
            ['name' => 'Hammer', 'sort_order' => 26],
            ['name' => 'Nuu', 'sort_order' => 27],
            ['name' => 'Gemini', 'sort_order' => 28],
        ];

        foreach ($brands as $brandData) {
            Brand::firstOrCreate(
                ['name' => $brandData['name']],
                $brandData
            );
        }

        $devices = [
            // Apple
            'Apple' => [
                ['name' => 'iPhone XR', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'iPhone XS', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'iPhone XS Max', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'iPhone 11', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'iPhone 11 Pro', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'iPhone 11 Pro Max', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'iPhone SE (2nd gen)', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPhone 12', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPhone 12 Mini', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPhone 12 Pro', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPhone 12 Pro Max', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPhone 13', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPhone 13 Mini', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPhone 13 Pro', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPhone 13 Pro Max', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPhone SE (3rd gen)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPhone 14', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPhone 14 Plus', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPhone 14 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPhone 14 Pro Max', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPhone 15', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'iPhone 15 Plus', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'iPhone 15 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'iPhone 15 Pro Max', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'iPhone 16', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPhone 16 Plus', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPhone 16 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPhone 16 Pro Max', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPhone 16e', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'iPhone 17', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'iPhone 17 Pro', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'iPhone 17 Pro Max', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'iPhone Air', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'iPad Pro 11-inch (1st gen)', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'iPad Pro 12.9-inch (3rd gen)', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'iPad Air (3rd gen)', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'iPad (7th gen)', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'iPad mini (5th gen)', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'iPad Pro 11-inch (2nd gen)', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPad Pro 12.9-inch (4th gen)', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPad (8th gen)', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPad Air (4th gen)', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'iPad Pro 11-inch (3rd gen)', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPad Pro 12.9-inch (5th gen)', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPad (9th gen)', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPad mini (6th gen)', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'iPad Air (5th gen)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPad (10th gen)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPad Pro 11-inch (4th gen)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPad Pro 12.9-inch (6th gen)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'iPad Air (6th gen)', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPad Pro 11-inch (M4)', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPad Pro 13-inch (M4)', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'iPhone 18', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'iPhone 18 Plus', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'iPhone 18 Pro', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'iPhone 18 Pro Max', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'iPhone 19', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'iPhone 19 Plus', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'iPhone 19 Pro', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'iPhone 19 Pro Max', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'iPhone SE (4th gen)', 'release_year' => 2025, 'model_identifiers' => []],
            ],

            // Samsung
            'Samsung' => [
                ['name' => 'Galaxy S20', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy S20+', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy S20 Ultra', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy S21', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Galaxy S21+', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Galaxy S21 Ultra', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Galaxy S22', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy S22+', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy S22 Ultra', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy S23', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy S23+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy S23 Ultra', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy S23 FE', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy S24', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy S24+', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy S24 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy S24 FE', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy S25', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy S25+', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy S25 Ultra', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip4', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip5', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip6', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip7', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip7 FE', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold4', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold5', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold6', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy A54', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy A55', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy A35', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy A36', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy A56', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy Note 20', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy Note 20 Ultra', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold2', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip 5G', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold3', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip3', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Galaxy S20 FE', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy S21 FE', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy A73 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy A34 5G', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy M54', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy F54', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy XCover 6 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy XCover 7', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S7', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S7+', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S7 FE', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S8', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S8+', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S8 Ultra', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S9', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S9+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S9 Ultra', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S9 FE', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab S9 FE+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab A9+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab Active4 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Tab Active5', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy Book 2 Pro 360', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Galaxy Book 3 Pro 360', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Galaxy Book 4 Pro 360', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Galaxy S26', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Galaxy S26+', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Galaxy S26 Ultra', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold7', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Fold8', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Galaxy Z Flip8', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Galaxy S27', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'Galaxy S27+', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'Galaxy S27 Ultra', 'release_year' => 2027, 'model_identifiers' => []],
            ],

            // Google
            'Google' => [
                ['name' => 'Pixel 2', 'release_year' => 2017, 'model_identifiers' => []],
                ['name' => 'Pixel 2 XL', 'release_year' => 2017, 'model_identifiers' => []],
                ['name' => 'Pixel 3', 'release_year' => 2017, 'model_identifiers' => []],
                ['name' => 'Pixel 3 XL', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'Pixel 3a', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'Pixel 3a XL', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'Pixel 4', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'Pixel 4 XL', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'Pixel 4a', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'Pixel 4a 5G', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Pixel 5', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Pixel 5a', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Pixel 6', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Pixel 6 Pro', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Pixel 6a', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Pixel 7', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Pixel 7 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Pixel 7a', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Pixel 8', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Pixel 8 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Pixel 8a', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Pixel 9', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Pixel 9 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Pixel 9 Pro XL', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Pixel Fold', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Pixel 10', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Pixel 10 Pro', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Pixel 10 Pro XL', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Pixel 10 Pro Fold', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Pixel 9a', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Pixel 11', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Pixel 11 Pro', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Pixel 11 Pro XL', 'release_year' => 2026, 'model_identifiers' => []],
                ['name' => 'Pixel 11a', 'release_year' => 2027, 'model_identifiers' => []],
                ['name' => 'Pixel Fold 2', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Pixel Fold 3', 'release_year' => 2025, 'model_identifiers' => []],
            ],

            // Huawei
            'Huawei' => [
                ['name' => 'Huawei P40', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Huawei P40 Pro', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Huawei P40 Pro+', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 40', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 40 Pro', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 40 Pro+', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Huawei P50', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Huawei P50 Pro', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Huawei P50 Pocket', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 50', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 50 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Huawei P60', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei P60 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei P60 Art', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 60', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 60 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei Mate 60 Pro+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei Mate X2', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Huawei Mate X3', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei Mate X5', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Huawei Pura 70', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Huawei Pura 70 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Huawei Pura 70 Pro+', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Huawei Pura 70 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
            ],

            // Honor
            'Honor' => [
                ['name' => 'Honor Magic 4 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Honor Magic 4 Ultimate', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Honor Magic 5', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor Magic 5 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor Magic 5 Ultimate', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor Magic 6', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Honor Magic 6 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Honor Magic 6 Ultimate', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Honor Magic V', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Honor Magic Vs', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Honor Magic V2', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor Magic V2 RSR', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Honor Magic V3', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Honor 50', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Honor 70', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Honor 90', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor 90 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor X8', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Honor X9a', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Honor Magic 7', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Honor Magic 7 Pro', 'release_year' => 2025, 'model_identifiers' => []],
            ],

            // Xiaomi
            'Xiaomi' => [
                ['name' => 'Xiaomi 12T', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Xiaomi 12T Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Xiaomi 12', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Xiaomi 12 Pro', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Xiaomi 12X', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Xiaomi 12S Ultra', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Xiaomi 13', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Xiaomi 13 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Xiaomi 13 Lite', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi 13 Ultra', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi 13T', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi 13T Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi 14', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi 14 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi 14 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi 14T', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi 14T Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi CIVI 4 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi 15', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi 15 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi 15 Ultra', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Redmi Note 12 Pro 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Redmi Note 12 Pro+ 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Redmi Note 13 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Redmi Note 13 Pro+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Redmi Note 13 Pro 5G', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Redmi Note 14 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Redmi Note 14 Pro+', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Xiaomi Mix Fold 2', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Xiaomi Mix Fold 3', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Xiaomi Mix Flip', 'release_year' => 2024, 'model_identifiers' => []],
            ],

            // Oppo
            'Oppo' => [
                ['name' => 'Oppo Find X3', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Oppo Find X3 Pro', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Oppo Find X5', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Oppo Find X5 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Oppo Find X6', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Oppo Find X6 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Oppo Find X7', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Oppo Find X7 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Oppo Find X8', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Oppo Find X8 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Oppo Find N', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Oppo Find N2', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Oppo Find N2 Flip', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Oppo Find N3', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Oppo Find N3 Flip', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Oppo Reno 6 Pro 5G', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Oppo Reno 9 Pro 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Oppo Reno 10 Pro+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Oppo Reno 11 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Oppo Reno 12 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Oppo A98 5G', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Vivo
            'Vivo' => [
                ['name' => 'Vivo X80', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X80 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X90', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X90 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X90 Pro+', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X100', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo X100 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo X100 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Vivo X Fold', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X Fold+', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Vivo X Fold2', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo X Fold3', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Vivo X Fold3 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Vivo X Flip', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo V27', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo V27 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo V29', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo V29 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Vivo V30', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Vivo V30 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Vivo V40', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Vivo V40 Pro', 'release_year' => 2024, 'model_identifiers' => []],
            ],

            // Sony
            'Sony' => [
                ['name' => 'Sony Xperia 1 III', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 5 III', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 10 III', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 10 III Lite', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 1 IV', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 5 IV', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 10 IV', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 1 V', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 5 V', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 10 V', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 1 VI', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 5 VI', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Sony Xperia 10 VI', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Sony Xperia Ace III', 'release_year' => 2022, 'model_identifiers' => []],
            ],

            // Motorola
            'Motorola' => [
                ['name' => 'Motorola Razr 2019', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'Motorola Razr 5G', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Motorola Razr 2022', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Motorola Razr 40', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Motorola Razr 40 Ultra', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Motorola Razr+', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Motorola Razr 50', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Motorola Razr 50 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 30', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 30 Fusion', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 30 Pro', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 30 Ultra', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 30 Neo', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 40', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 40 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 40 Neo', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 50 Pro', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 50 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Motorola Edge 50 Fusion', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Moto G52j 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Moto G53j 5G', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Moto G54 5G', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Moto G84 5G', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Moto G Stylus 5G 2024', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Moto G Power 5G 2024', 'release_year' => 2024, 'model_identifiers' => []],
            ],

            // Microsoft
            'Microsoft' => [
                ['name' => 'Surface Pro X', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'Surface Pro 8', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Surface Pro 9 (5G)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Surface Pro 10 for Business', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Surface Pro 11', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Surface Go 2 LTE', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Surface Go 3 LTE', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Surface Go 4', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Surface Duo', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Surface Duo 2', 'release_year' => 2021, 'model_identifiers' => []],
            ],

            // Lenovo
            'Lenovo' => [
                ['name' => 'ThinkPad X1 Carbon Gen 9', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Carbon Gen 10', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Carbon Gen 11', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Carbon Gen 12', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Nano', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Nano Gen 2', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Nano Gen 3', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Fold', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'ThinkPad X1 Fold 16', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'ThinkPad X13s', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'ThinkPad T14s Gen 3', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'ThinkPad T14s Gen 4', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Yoga 9i 5G', 'release_year' => 2022, 'model_identifiers' => []],
            ],

            // Dell
            'Dell' => [
                ['name' => 'Latitude 7320 Detachable', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Latitude 7420', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Latitude 9420', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Latitude 7430', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Latitude 9430', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Latitude 7440', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Latitude 9440', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'XPS 13 9310', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'XPS 13 Plus 9320', 'release_year' => 2022, 'model_identifiers' => []],
            ],

            // HP
            'HP' => [
                ['name' => 'EliteBook 840 G8', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'EliteBook 1040 G8', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'EliteBook 840 G9', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'EliteBook 1040 G9', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'EliteBook 840 G10', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'EliteBook 1040 G10', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Spectre x360 14', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Dragonfly G4', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Acer
            'Acer' => [
                ['name' => 'Swift 3', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Swift 7', 'release_year' => 2019, 'model_identifiers' => []],
                ['name' => 'Swift Edge 16', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // OnePlus
            'OnePlus' => [
                ['name' => 'OnePlus 11', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'OnePlus 12', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'OnePlus Open', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'OnePlus 13', 'release_year' => 2025, 'model_identifiers' => []],
            ],

            // Fairphone
            'Fairphone' => [
                ['name' => 'Fairphone 4', 'release_year' => 2021, 'model_identifiers' => []],
                ['name' => 'Fairphone 5', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Nothing
            'Nothing' => [
                ['name' => 'Nothing Phone (1)', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Nothing Phone (2)', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Nothing Phone (2a)', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Nothing Phone (3)', 'release_year' => 2025, 'model_identifiers' => []],
            ],

            // Nokia
            'Nokia' => [
                ['name' => 'Nokia G60 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Nokia X30 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Nokia XR21', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Asus
            'Asus' => [
                ['name' => 'ROG Phone 8', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'ROG Phone 9', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Zenfone 11 Ultra', 'release_year' => 2024, 'model_identifiers' => []],
            ],

            // Realme
            'Realme' => [
                ['name' => 'Realme 12 Pro+', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Realme 13 Pro+', 'release_year' => 2025, 'model_identifiers' => []],
                ['name' => 'Realme GT 5 Pro', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Sharp
            'Sharp' => [
                ['name' => 'Aquos Sense 8', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Aquos R8 Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Aquos R9', 'release_year' => 2024, 'model_identifiers' => []],
                ['name' => 'Aquos Sense 7', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Aquos Wish 3', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Rakuten
            'Rakuten' => [
                ['name' => 'Rakuten Mini', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Rakuten Hand', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Rakuten Hand 5G', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Rakuten Big', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Rakuten Big S', 'release_year' => 2021, 'model_identifiers' => []],
            ],

            // ZTE
            'ZTE' => [
                ['name' => 'Nubia Z60 Ultra', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Axon 40 Ultra', 'release_year' => 2022, 'model_identifiers' => []],
                ['name' => 'Axon 50 Ultra', 'release_year' => 2023, 'model_identifiers' => []],
            ],

            // Nubia
            'Nubia' => [
                ['name' => 'Nubia Z50S Pro', 'release_year' => 2023, 'model_identifiers' => []],
                ['name' => 'Nubia Flip 5G', 'release_year' => 2024, 'model_identifiers' => []],
            ],

            // Hammer
            'Hammer' => [
                ['name' => 'Blade 3', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Explorer Pro', 'release_year' => 2020, 'model_identifiers' => []],
                ['name' => 'Blade 5G', 'release_year' => 2021, 'model_identifiers' => []],
            ],

            // Nuu
            'Nuu' => [
                ['name' => 'Nuu X5', 'release_year' => 2020, 'model_identifiers' => []],
            ],

            // Gemini
            'Gemini' => [
                ['name' => 'Gemini PDA', 'release_year' => 2018, 'model_identifiers' => []],
                ['name' => 'Cosmo Communicator', 'release_year' => 2019, 'model_identifiers' => []],
            ],

        ];

        foreach ($devices as $brandName => $brandDevices) {
            $brand = Brand::where('name', $brandName)->first();

            if (!$brand) {
                continue;
            }

            foreach ($brandDevices as $deviceData) {
                Device::firstOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'name' => $deviceData['name'],
                    ],
                    [
                        'brand_id' => $brand->id,
                        'name' => $deviceData['name'],
                        'release_year' => $deviceData['release_year'] ?? null,
                        'model_identifiers' => $deviceData['model_identifiers'] ?? null,
                        'esim_supported' => true,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}

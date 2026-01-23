<?php

namespace App\Abstracts\Setting;

class ArraySettingType extends AbstractSettingType
{
    public function __construct()
    {
        parent::__construct(SettingType::Array);
    }
}

<?php

namespace App\Abstracts\Setting;

class StringSettingType extends AbstractSettingType
{
    public function __construct()
    {
        parent::__construct(SettingType::String);
    }
}

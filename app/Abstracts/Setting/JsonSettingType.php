<?php

namespace App\Abstracts\Setting;

class JsonSettingType extends AbstractSettingType
{
    public function __construct()
    {
        parent::__construct(SettingType::Json);
    }
}

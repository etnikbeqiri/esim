<?php

namespace App\Abstracts\Setting;

class FloatSettingType extends AbstractSettingType
{
    public function __construct()
    {
        parent::__construct(SettingType::Float);
    }
}

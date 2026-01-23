<?php

namespace App\Abstracts\Setting;

class BooleanSettingType extends AbstractSettingType
{
    public function __construct()
    {
        parent::__construct(SettingType::Boolean);
    }
}

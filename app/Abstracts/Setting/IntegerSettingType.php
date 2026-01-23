<?php

namespace App\Abstracts\Setting;

class IntegerSettingType extends AbstractSettingType
{
    public function __construct()
    {
        parent::__construct(SettingType::Integer);
    }
}

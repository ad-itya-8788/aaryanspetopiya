<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $fillable = [
        'full_name',
        'mobile',
        'email',
        'insta_id',
        'pincode',
        'state',
        'district',
        'city',
        'area',
        'address',
    ];
}

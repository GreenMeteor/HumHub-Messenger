<?php
namespace humhub\modules\messenger\forms;

use Yii;

class SettingsForm extends \yii\base\Model
{

    public $slot;

    public $sort;

    public function rules()
    {
        return [
            [
                [
                    'slot',
                    'sort'
                ],
                'safe'
            ],
            [
                [
                    'slot',
                    'sort'
                ],
                'required'
            ],
            [
                [
                    'slot'
                ],
                'string',
                'max' => 255
            ],
            [
                [
                    'sort'
                ],
                'integer',
                'min' => 0,
                'max' => '2000'
            ]
        ];
    }

    public function attributeLabels()
    {
        return [
            'slot' => Yii::t('MessengerModule.base', 'slot'),
            'sort' => Yii::t('MessengerModule.base', 'sort')
        ];
    }
}

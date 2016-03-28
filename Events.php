<?php
namespace humhub\modules\messenger;

use Yii;
use yii\helpers\Url;
use humhub\modules\messenger\widgets\MessengerFrame;
use humhub\models\Setting;

class Events extends \yii\base\Object
{

    public static function onAdminMenuInit(\yii\base\Event $event)
    {
        $event->sender->addItem([
            'label' => Yii::t('MessengerModule.base', 'Messenger Settings'),
            'url' => Url::toRoute('/messenger/admin/index'),
            'group' => 'settings',
            'icon' => '<i class="fa fa-weixin"></i>',
            'isActive' => Yii::$app->controller->module && Yii::$app->controller->module->id == 'messenger' && Yii::$app->controller->id == 'admin',
            'sortOrder' => 800
        ]);
    }

    public static function addMessengerFrame($event)
    {
        if (Yii::$app->user->isGuest) {
            return;
        }
        $event->sender->addWidget(MessengerFrame::className(), [], [
            'sortOrder' => Setting::Get('timeout', 'messenger')
        ]);
    }
}

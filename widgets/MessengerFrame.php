<?php
namespace humhub\modules\messenger\widgets;

use humhub\components\Widget;

class MessengerFrame extends Widget
{

    public $contentContainer;

    public function run()
    {
        return $this->render(' messengerframe', []);
    }
}


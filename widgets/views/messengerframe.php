<?php
use yii\helpers\Url;
use humhub\models\Setting;
?>
<div class="panel">
  <div class="panel-heading">
    <?=Yii::t('MessengerModule.base', '<strong>Messenger</strong>'); ?>
  </div>
  <div class="panel-body">
  
<?php $this->registerJsFile( $this->getBaseUrl().'/js/togetherjs.js', ['position'=>\yii\web\View::Sidebar]); ?>
<?php $this->registerJsFile( $this->getBaseUrl().'/js/togetherjs-min.js', ['position'=>\yii\web\View::Sidebar]); ?>
<button onclick="TogetherJS(this); return false;">Chat</button>

  </div>
</div>

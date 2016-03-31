<?php
use yii\helpers\Url;
use humhub\models\Setting;
?>
<div class="panel">
  <div class="panel-heading">
    <?=Yii::t('MessengerModule.base', '<strong>Messenger</strong>'); ?>
  </div>
  <div class="panel-body">
  
<script src="https://togetherjs.com/togetherjs-min.js"></script>
<button onclick="TogetherJS(this); return false;">Chat</button>

  </div>
</div>

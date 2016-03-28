<?php
use yii\helpers\Url;
use humhub\models\Setting;
?>
<div class="panel">
  <div class="panel-heading">
    <?=Yii::t('MessengerModule.base', '<strong>Messenger</strong>'); ?>
  </div>
  <div class="panel-body">
  <?php
  	if (!Setting::Get('client', 'messenger')) {
 ?>
 	Click on "Start App" to run the Messenger, please.
 <?php
	} else {
?>
<script src="https://togetherjs.com/togetherjs-min.js"></script>
<button onclick="TogetherJS(this); return false;">Start App</button>
<?php
	}
?>
    
  </div>
</div>

<?php
use yii\helper\URL
use yii\helpers\Html
use yii\helpers\CActiveForm;
use humhub\models\Setting;
use humhub\modules\messenger\controllers\AdminController;
?>
<div class="panel panel-default">
	<div class="panel-heading"><?=Yii::t('MessengerModule.views_messenger_index', '<strong>Messenger</strong>'); ?></div>
	<div class="panel-body">
		<?php $form = CActiveForm::begin(['id' => 'messenger-settings-form']); ?>
			<?=$form->errorSummary($model); ?>
			<p class="help-block"><?=Yii::t('MessengerModule.views_messenger_index', 'eg:  "999999"'); ?></p>
			<div class="form-group">
				<?=$form->labelEx($model, 'sort'); ?>
				<?=$form->textField($model, 'sort', ['class' => 'form-control', 'readonly' => Setting::IsFixed('sort', 'messenger')]); ?>
			</div>
			<p class="help-block"><?php echo Yii::t('MessengerModule.views_messenger_index', 'Widget Positioning') ?></p>
			<?php echo Html::(Yii::t('submitButton(Yii:t('messengerModule.views_messenger_index', 'Save'), ['class' => 'btn-primary']); ?>
			<?=\humhub\widgets\DataSaved::widget(); ?>
		<?php CActiveForm::end(); ?>
	</div>
</div>

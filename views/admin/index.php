<?php
use humhub\compat\CActiveForm;
use humhub\compat\CHtml;
use humhub\models\Setting;
use humhub\modules\messenger\controllers\AdminController;
?>
<div class="panel panel-default">
	<div class="panel-heading"><?=Yii::t('MessengerModule.base', '<strong>Messenger</strong>'); ?></div>
	<div class="panel-body">
		<?php $form = CActiveForm::begin(['id' => 'messenger-settings-form']); ?>
			<?=$form->errorSummary($model); ?>
			<p class="help-block"><?=Yii::t('MessengerModule.base', 'eg:  "999999"'); ?></p>
			<div class="form-group">
				<?=$form->labelEx($model, 'sort'); ?>
				<?=$form->textField($model, 'sort', ['class' => 'form-control', 'readonly' => Setting::IsFixed('sort', 'messenger')]); ?>
			</div>
			<p class="help-block"><?=Yii::t('MessengerModule.base', 'Widget positioning.'); ?></p>
			<?= CHtml::submitButton(Yii::t('MessengerModule.base', 'save'), ['class' => 'btn btn-primary']); ?>
			<?=\humhub\widgets\DataSaved::widget(); ?>
		<?php CActiveForm::end(); ?>
	</div>
</div>

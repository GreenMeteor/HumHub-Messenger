<?php
namespace humhub\modules\messenger\controllers;

use Yii;
use humhub\models\Setting;
use yii\helpers\Url;

class AdminController extends \humhub\modules\admin\components\Controller
{

    public function behaviors()
    {
        return [
            'acl' => [
                'class' => \humhub\components\behaviors\AccessControl::className(),
                'adminOnly' => true
            ]
        ];
    }

    public function actionIndex()
    {
        $form = new \humhub\modules\messenger\forms\SettingsForm();
        if ($form->load(Yii::$app->request->post())) {
            if ($form->validate()) {
                Setting::Set('slot', $form->slot, 'messenger');
                Setting::Set('sort', $form->sort, 'messenger');
                
                Yii::$app->session->setFlash('data-saved', Yii::t('MessengerModule.base', 'Saved'));
                // $this->redirect(Url::toRoute('index'));
            }
        } else {
            $form->slot = Setting::Get('slot', 'messenger');
            $form->sort = Setting::Get('sort', 'messenger');
        }
        
        return $this->render('index', [
            'model' => $form
        ]);
    }

}

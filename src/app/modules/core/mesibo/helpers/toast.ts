import * as moment from 'moment';
import { ToastController } from '@ionic/angular';

export function showToast(status = null, msg = null) {
    let toast: ToastController;
        let message, btnText: any, color;
        switch (status) {
          case 'error':
            message = msg ? msg : 'Something Went Wrong',
              btnText = 'OH',
              color = 'danger';
            break;
    
          case 'warning':
            message = msg ? msg : 'kind reminder you',
              btnText = 'Attention',
              color = 'warning';
            break;
    
          case 'info':
            message = msg ? msg : 'notification',
              btnText = '',
              color = 'secondary';
            break;
    
          default:
            message = msg ? msg : ' Freaking Success ',
              btnText = 'YEAH',
              color = 'success';
            break;
        }
        let alert=toast.create({
          message: message,
          color: color,
          position: "top",
          animated: true,
          // cssClass:"my-custom-class"
          duration: 2000
        }).then((toastData) => {
          toastData.present();
        });
}

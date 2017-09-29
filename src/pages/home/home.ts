import { Component } from '@angular/core';
import { NavController, 
  AlertController, 
  ActionSheetController } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

items: FirebaseListObservable<any[]>; 


  displayName;
  userID; 
  tasks;  
   
  constructor(public navCtrl: NavController,
    private afAuth: AngularFireAuth, private fb: Facebook, private platform: Platform, afDB: AngularFireDatabase, public alertCtrl: AlertController, public actionCtrl: ActionSheetController) {

    afAuth.authState.subscribe((user: firebase.User) => {
      if (!user) {
        this.displayName = 'Please log in';
        return;
      }
      //get the username and id
      this.displayName = user.displayName;   
      this.userID = user.uid;

      //put them in the database for reference
     firebase.database().ref('/users/' + this.userID).update({displayName: this.displayName}); 
     this.tasks = afDB.list('/users/' + this.userID + '/tasks/');
     console.log(this.tasks);

    });
  }

  signInWithFacebook() {
    if (this.platform.is('cordova')) {
      return this.fb.login(['email', 'public_profile']).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredential)
        ;
      })
    }
    else {
      return this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(res => console.log(res));
    }
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.tasks = "";
  }
 
addTask() {
 let prompt = this.alertCtrl.create({
  title: 'New Task', 
  message: '', 
  inputs: [
  {
    name: 'title', 
    placeholder: 'Task'
  },
  {
    name:'notes',
    placeholder:'Note:'
  }
  ],
  buttons: [
  {
    text: 'Cancel', 
    handler: data => {
      console.log('Cancel clicked'); 
    }
  },
  {
    text: 'Save', 
    handler: data => {
      this.tasks.push({
        title: data.title, notes:data.notes
      });
    }
  }
  ]
 });
 prompt.present();
}


showOptions(taskId, taskTitle, taskNotes) {
let actionSheet = this.actionCtrl.create({
  title: 'What do you want to do?', 
  buttons: [
  {
    text: 'Delete task', 
    role: 'destructive', 
    handler: () => {
      this.removeTask(taskId); 
    }
  },
  {
    text: 'Update task', 
    handler: () => {
      this.updateTask(taskId, taskTitle, taskNotes);
    }
  },
  {
    text: 'Cancel', 
    handler:() => {
      console.log('Cancel Clicked'); 
    }
  }
  ]
});
actionSheet.present();
}

removeTask(taskId: string) {
  this.tasks.remove(taskId); 
}

updateTask(taskId, taskTitle, taskNotes){
  let prompt = this.alertCtrl.create({
    title: 'Update',
    message: "",
    inputs: [
      {
        name: 'title',
        placeholder: '',
        value: taskTitle
      },
      {
        name: 'notes',
        placeholder: '', 
        value: taskNotes
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Save',
        handler: data => {
          this.tasks.update(taskId, {
            title: data.title,
            notes: data.notes
          });
        }
      }
    ]
  });
  prompt.present();
}
}
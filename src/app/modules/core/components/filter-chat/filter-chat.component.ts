import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppConstServ } from '../../../../shared/helper/app-constant.service';
import { Subscription } from 'rxjs';
import { QBService } from '../messenger/qb/services/qb.service';
import { QBDialogueService } from '../messenger/qb/services/qbDialogue.service';
import { getFullUrl, filterData, stringSearch } from '../../../../shared/helper/utilityHelper';
import { AuthService } from '../../../users/services/auth.service';
import { QBHelperService } from '../messenger/qb/helpers/qbHelper.service';

@Component({
  selector: 'app-filter-chat',
  templateUrl: './filter-chat.component.html',
  styleUrls: ['./filter-chat.component.scss']
})
export class FilterChatComponent implements OnInit {

  @Input()
  public set searchText(searchText: string) {
    this.onFilterDialogue(searchText);
  }
  @Output() onSelectContactListEvent = new EventEmitter<string>();
  profileImg = AppConstServ.DEFAULT_PROFILE_URL;
  qbEventSubscription: Subscription;
  contactList: any = [];
  dialogueList: any = [];
  loader:boolean=false;
  constructor(private qbService: QBService,
    private auth: AuthService,
    private qbhelper: QBHelperService,
    private dialogueService: QBDialogueService, ) { }

  ngOnInit(): void {
    this.contactList = Object.values(this.qbService.contactList),
      this.qbEventSubscription = this.qbService.getObserverEvents()
        .subscribe((message: any) => {

        });
  }

  getProfileUrl(dialogs, url=false) {
    if (dialogs) {
      return this.qbhelper.getDialogueImage(dialogs);
    } else {
      return getFullUrl(url);
    }
  }

  async onFilter(searchText) {
    let filters: any = {
      firstName: firstName => firstName.toLowerCase().includes(searchText.toLowerCase()),
      //lastName: lastName => lastName.toLowerCase().includes(searchText.toLowerCase()),
      //email: email => email.toLowerCase().includes(searchText.toLowerCase())
    };
    let qbid = this.auth.currentUserValue.qbid;
    let filterPrivateChat: any;
    let exceptqbid: any = []
    if (this.dialogueList.length) {
      filterPrivateChat = await this.dialogueList.filter(a => {
        if (a.type === 3) {
          let y = a.occupants_ids.findIndex(x => x != qbid)
          if (y !== -1) {
            exceptqbid.push(a.occupants_ids[y])
          }
        }
      });
      //filters.qbid = qbid  => !exceptqbid.includes(qbid); 
    }
    this.contactList = Object.values(this.qbService.contactList).filter((a: any) => {
      let res = stringSearch(a.firstName, searchText) || stringSearch(a.lastName, searchText) || stringSearch(a.email, searchText);
      if (res) {
        if (!exceptqbid.includes(a.qbid)) {
          return res;
        }
      }
      return false;
    });
  }

  async onFilterDialogue(searchText) {
    if (!searchText) {
      this.dialogueList = Object.values(this.dialogueService.dialogs);
    } else {
      let filters: any = {
        name: name => name.toLowerCase().includes(searchText.toLowerCase())
      };
      this.dialogueList = await filterData(filters, Object.values(this.dialogueService.dialogs));
      this.onFilter(searchText);
    }
  }



  createChat(contact) {
    //open message window for the contact
    if (contact.qbid) {
      let param = {
        'type': 3,
        'occupants_ids': contact.qbid
      };
      this.dialogueService.createDialog(param).then(res => {
        this.onSelectContactListEvent.emit(res._id);
      });
    }
  }

  showChat(contact) {
    //open message window for the contact
    this.onSelectContactListEvent.emit(contact._id),
      console.log(`Message window for ${contact}`);
  }



  ngOnDestroy(): void {
    this.qbEventSubscription.unsubscribe();
  }

}

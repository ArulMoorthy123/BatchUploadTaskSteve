import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../modules/users/services/auth.service';
import { ChatService } from '../../modules/core/mesibo/providers/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent implements OnInit, OnDestroy {
  chatEventSubscription: Subscription;
  constructor(public auth: AuthService, public chatService: ChatService) {}

  ngOnInit(): void {
    this.chatEventSubscription = this.chatService
      .getObserverEvents()
      .subscribe(async (message: any) => {
        switch (message.type) {}
      });
  }
  get loginStatus(): boolean {
    return this.auth.loginStatus();
  }

  ngOnDestroy(): void {
    this.chatEventSubscription.unsubscribe();
  }
}

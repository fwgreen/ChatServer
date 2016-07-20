import {Component, bootstrap, FORM_DIRECTIVES, CORE_DIRECTIVES} from 'angular2/angular2';
import {HTTP_PROVIDERS, Http} from 'angular2/http';

class Message {
  user: string;
  message: string;
  constructor(user: string, message: string) {
    this.user = user;
    this.message = message;
  }
}

@Component({
  selector: 'myapp',
  providers: [HTTP_PROVIDERS],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-xs-6">
          <h1>Messages</h1>
          <ul class="list-group">
            <li class="list-group-item" *ngFor="#message of messages">
              <h4 class="list-group-item-heading">{{split_message(message)[0]}}</h4>
              <p class="list-group-item-text">{{split_message(message)[1]}}</p>
            </li>
          </ul>
        </div>
      <div class="col-xs-4">
        <h1>Say Something!</h1>
        <form id="messageform">
          <fieldset class="form-group">
            <input #name class="form-control" placeholder="enter your name">
          </fieldset>
          <fieldset class="form-group">
            <textarea [(ngModel)]="message" class="form-control" name="comment" form="commentform" placeholder="send a message"></textarea>
          </fieldset>
          <button (click)="send_message(name.value)" type="button" class="btn btn-primary">add comment</button>
        </form>
      </div>
    </div>
  </div>
`,
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})

class AppComponent {

  messages: Array<string> = [];
  message: string;
  ws: WebSocket;

  constructor(public http: Http) {
    const BASE_URL = 'ws://localhost:4567/chat';
    this.ws = new WebSocket(BASE_URL);

    this.ws.onerror   = (evt: ErrorEvent) => this.messages.unshift(`Error: ${evt.message}`);
    this.ws.onmessage = (evt: MessageEvent) => this.messages.unshift(evt.data);
    this.ws.onclose   = (evt: CloseEvent) => this.messages.unshift("** Closed **");
    this.ws.onopen    = (evt: Event) => this.messages.unshift("** Openned ***");
  }

  split_message(message: string): Array<String> {
    return message.replace("\"","").split(":")
  }
  send_message(name: string) {
    this.ws.send(`${ name }: ${ this.message }`);
    this.message = '';
  }
}

bootstrap(AppComponent);

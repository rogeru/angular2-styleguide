import {Component, View} from 'angular2/core';
import {Http} from 'angular2/http';
import {Router, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {NavigationService} from './navigation.service';

@Component({
    selector: 'navigation'
})
@View({
    template: `
        <div *ngFor="#section of sections">
            <div class="section">{{section.name}}</div>
            <div *ngFor="#item of section.items"
                [class]="getSelectedClass(item)"
                (click)="onSelect(item)"
                [routerLink]="['WebPage', {page: item.path}]">
                <a>{{item.name}}</a>
            </div>
        </div>
    `,
    directives: [ROUTER_DIRECTIVES],
    styles: [`
        div {
            padding: 4px;
        }
        .section {
            font-weight: bold;
            text-transform: uppercase;
        }
        .selected {
            background-color: #f9f9f9
        }
    `]
})
export class NavigationComponent {
    selection: any = null;
    sections: Array<any>;
    platforms: Array<any> = [
        {name: 'Web', value: 'Web'},
        {name: 'iOS', value: 'IOS'},
        {name: 'Android', value: 'Android'}
    ];

    constructor(http: Http, public router: Router, navService: NavigationService) {
        // Subscribe to the navigation structure
        navService.sections.subscribe(sections => this.sections = sections);

        // Subscribe to route changes
        router.subscribe(path => {
            router.recognize(path).then(r => {
                this.selection = decodeURIComponent(r.component.params['page']);
            });
        });
    }

    getSelectedClass(item) {
        return item.name === this.selection ? 'selected' : undefined;
    }

    onSelect(item) {
        // Set selection here as well for improved UX
        this.selection = item.name;
    }
}
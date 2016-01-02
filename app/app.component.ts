import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {NavigationService} from './navigation.service';

import {NavigationComponent} from './navigation.component';
import {RendererComponent} from './renderer.component';

import {HeroesComponent} from './heroes.component';
import {HeroDetailComponent} from './hero-detail.component';
import {DashboardComponent} from './dashboard.component';
import {HeroService} from './hero.service';

@Component({
    selector: 'app',
    template: `
        <header>
            <div [routerLink]="['WebDefault']">Circuit Styleguide</div>
            <div class="flex-grow"></div>
            <!-- <div><input placeholder="Search" type="text" id="test"></div> -->
        </header>
        <main>
            <nav>
                <navigation></navigation>
            </nav>
            <section>
                <router-outlet></router-outlet>
            </section>
        </main>
        <footer>Unify Inc, 2015</footer>
    `,
    styleUrls: ['app/app.component.css'],
    directives: [ROUTER_DIRECTIVES, NavigationComponent],
    providers: [HeroService, NavigationService, ROUTER_PROVIDERS, HTTP_PROVIDERS]
})
@RouteConfig([
    {path: '/web', name: 'WebDefault', component: RendererComponent, useAsDefault: true},
    {path: '/web/:page', name: 'WebPage', component: RendererComponent}
])
export class AppComponent {
    search: string = '';
}

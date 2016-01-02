import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import 'rxjs/add/operator/map';

@Injectable()
export class NavigationService {
    sections: any;

    constructor(public http: Http) {
        this.sections = http.get('nav.json')
            .map((res: Response) => {
                let sections: any[] = <any[]>res.json();
                sections.forEach(section => section.items.forEach(page => page.path = encodeURIComponent(page.name)));
                return sections;
            });
    }

    // TODO: use sections observable instead of retrieving nav.json again
    getUrl(page: string) {
        return this.http.get('nav.json')
            .map((res: Response) => {
                let sections: any[] = <any[]>res.json();
                let url: string = '';
                sections.forEach(section => {
                    section.items.forEach(_page => {
                        let path = encodeURIComponent(_page.name);
                        if (page === path) {
                            url = _page.url;
                        }
                    });
                });
                return url;
            });

    }
}
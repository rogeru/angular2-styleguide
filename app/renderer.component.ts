import {Component, View} from 'angular2/core';
import {RouteParams, Location} from 'angular2/router';
import {Http} from 'angular2/http';
import {NavigationService} from './navigation.service';
import {MarkdownParser} from 'markdownParser';
import * as Highlight from 'highlight';

@Component({
    selector: 'renderer'
})
@View({
    template: `
        <h1 class="styleguide-title">{{title}}</h1>
        <div class="styleguide-toc">
            <a href="{{getUrl(block.heading)}}" *ngFor="#block of blocks" [class]="block.class">{{block.heading}}</a>
        </div>
        <div class="styleguide-section" *ngFor="#block of blocks" [innerHtml]="block.content"></div>
    `,
  directives: []
})
export class RendererComponent {
    title: string = '';
    hash: string;

    // todo: create class for Block with getter for "class"
    blocks: Array<any> = [];

    constructor(http: Http, public params: RouteParams, navService: NavigationService, public location: Location) {
        let page: string = params.get('page') || encodeURIComponent('Circuit Styleguide');
        this.hash = window.location.hash;

        navService.getUrl(page).subscribe(url => {
            let fileType: string = url.split('.').slice(-1)[0];
            let parser = new MarkdownParser();

            // Marked options including higlighting
            parser.setOptions({
                sanitize: false,
                gfm: true,
                tables: true,
                highlight: function (code) {
                    return Highlight.highlightAuto(code).value;
                }
            });

            // Add id's for headings
            parser.renderer.heading = function (text, level) {
                let escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
                return '<h' + level + ' id=' + escapedText + '>' + text + '</h' + level + '>';
            };

            // Fetch less/markdown file
            http.get(url)
                .map(res => res.text())
                .subscribe(data => {
                    data = parser.extract(fileType, data);
                    let res = parser.render(data);
                    this.title = res.title;
                    this.blocks = res.blocks;
                });
        });
    }

    afterViewChecked () {
        // Lifecycle event after DOM is rendered. Scroll to heading if needed.
        if (this.hash) {
            let element = document.getElementById(this.hash.substring(1));
            element && element.scrollIntoView();
        }
    }

    private encodeHeading(heading: string) {
        return heading.toLowerCase().replace(/ /g, '-');
    }

    private getUrl(heading: string) {
        return (this.location.path() + '#' + this.encodeHeading(heading));
    }
}

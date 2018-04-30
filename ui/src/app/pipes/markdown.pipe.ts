import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
declare var markdownitEmoji: any;
import * as markdown_it from 'markdown-it';

@Pipe({
	name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {

	private markdownIt: any;

	constructor(private sanitizer: DomSanitizer) {
		this.markdownIt = new markdown_it();
		this.markdownIt.use(markdownitEmoji);
	}

	transform(value: string): any {
		let md = this.markdownIt.renderInline(value);
		if (md.includes('<img')) {
			md = md.slice(0, 4) + ' class="img-fluid" ' + md.slice(4);
		}
		return md;
	}

}

import { SimpleVotePage } from './app.po';

describe('simple-vote App', () => {
  let page: SimpleVotePage;

  beforeEach(() => {
    page = new SimpleVotePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

import { MomentPipe } from './moment.pipe';

describe('MomentPipe', () => {
  it('create an instance', () => {
    const pipe = new MomentPipe();
    expect(pipe).toBeTruthy();
  });
});

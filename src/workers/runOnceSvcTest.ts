import { RunOnceSvc } from './runOnceSvc';

class TestRunOnceSvc extends RunOnceSvc {
    public runMe(data: object): object|undefined {
        return data;
    }
}

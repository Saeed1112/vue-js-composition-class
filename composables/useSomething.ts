import {BaseModel} from "~/type/base-model";


class Something extends BaseModel<any> {

}

export const useSomething = () => new Something('tracks');

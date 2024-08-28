import {Poste_INT, PosteData as PData, Data_Source as PDataSrc, Load_Type as PLoad_Type from '../repository/poste_interface'

export type PosteData = PData;
export type Data_Source = PDataSrc;
export type Load_Type = PLoad_Type;

export interface PosteMeteor_INT extends Poste_INT {

}

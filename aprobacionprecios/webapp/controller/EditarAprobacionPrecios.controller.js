sap.ui.define([
	"./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/Link',
    'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
	'sap/m/MessageBox'
],

	function (BaseController,Controller,JSONModel,History,Link,MessagePopover, MessageItem, MessageToast,MessageBox) {
		"use strict";
		//const this.onLocation() = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var usuario="";
		return BaseController.extend("tasa.com.aprobacionprecios.controller.App", {
			onInit: function () {
				var oGlobalBusyDialog = new sap.m.BusyDialog();
				this.router = this.getOwnerComponent().getRouter(this);
				this.router.getRoute("EditarAprobacionPrecios").attachPatternMatched(this._onPatternMatche, this);
				let ViewModel= new JSONModel(
					{}
					);
				this.setModel(ViewModel,"precio");
				this.loadPrecios();
				this.byId("txtTipoPrecio").setValue("COMPRA");
				this.setModel(ViewModel,"dataAprobacionPrecios")
				this._getCurrentUser();

			},
			_getCurrentUser: async function(oViewModel){
						let oUshell = sap.ushell,
						oUser={};
						if(oUshell){
							let  oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
							let sEmail = oUserInfo.getEmail().toUpperCase(),
							sName = sEmail.split("@")[0],
							sDominio= sEmail.split("@")[1];
							if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
							oUser = {
								name:sName
							}
						}else{
							oUser = {
								name: "FGARCIA"
							}
						}
			
						this.usuario=oUser.name;
						console.log(this.usuario);
			},
			_onPatternMatche: function(oEvent){
				
				var oArguments = oEvent.getParameter("arguments");
				var cadena = oArguments.cadena;
				this.getView().getModel("AprobacionPrecio");
				this.getView().bindElement({path: "AprobacionPrecio>/listaAprobacionPrecio/"+ cadena})
				console.log(this.getView().getModel("AprobacionPrecio").oData);
				console.log(this.getView().getModel("AprobacionPrecio").oData.listaAprobacionPrecio);
				var arrayCadena=cadena.split(",");
				var cant=this.getView().getModel("AprobacionPrecio").oData.listaAprobacionPrecio.length;
                var data=[{}];
                for(var j=0;j<arrayCadena.length;j++){
                    for(var i=0;i<cant;i++){
                        if(i==arrayCadena[j]){
                            
                        data[j]=this.getView().getModel("AprobacionPrecio").oData.listaAprobacionPrecio[i];
                        }
                    }
                }
             
                for(var j=0;j<data.length;j++){
                   this.getView().getModel("dataAprobacionPrecios").setProperty("/items", data);
                   
                }
				console.log(this.getView().getModel("dataAprobacionPrecios").setProperty("/items", data));
			},
			loadPrecios: function(){
				var zdoTipoMareaDom;
				const bodyDominio = {
					"dominios": [
						{
							"domname": "ZESPRC",
							"status": "A"
						}
					]
				}
					fetch(`${ this.onLocation()}dominios/Listar`,
					{
						method: 'POST',
						body: JSON.stringify(bodyDominio)
					})
					.then(resp => resp.json()).then(data => {
						
						console.log(data);
					  
						zdoTipoMareaDom= data.data.find(d => d.dominio == "ZESPRC").data;
						this.getModel("precio").setProperty("/zdoTipoMareaDom", zdoTipoMareaDom);
					}).catch(error => console.log(error)
					);
			},
			editar: function(){
				oGlobalBusyDialog.open();
				let estadoPrecio = this.byId("idEstado").getSelectedKey();
				if(!estadoPrecio)
				{
					MessageBox.error("Debe ingresar un estado de precio");
					oGlobalBusyDialog.close();
					return true;
				}
				console.log(estadoPrecio)
				var data=this.getView().getModel("dataAprobacionPrecios").oData;
            	var tamanioArray=this.getView().getModel("dataAprobacionPrecios").oData.items.length;
				console.log(tamanioArray);
				var cadena_str_set=[];
				for(var i=0;i<tamanioArray;i++){
					cadena_str_set.push({
						cmopt: "NRMAR = "+data.items[i].NRMAR.replace(/^(0+)/g, '')+" AND CDSPC = "+"'"+data.items[i].CDSPC+"'",
						cmset: "ESPRC = "+"'"+estadoPrecio+"'"+" USAPR = 'FGARCIA' FHAPR = '20210825' HRAPR = '204230'",
						nmtab: "ZFLPMA"
					});
				}
				var body={
					"p_user":this.usuario,
					"str_set": cadena_str_set
				};

				fetch(`${ this.onLocation()}General/Update_Camp_Table`,
                    {
                        method: 'POST',
                        body: JSON.stringify(body)
                    })
                    .then(resp => resp.json()).then(data => {
                        MessageBox.success(
                            "Los datos fueron guardados correctamente ", {
                                icon: MessageBox.Icon.SUCCESS,
                                title: "Guardado Satisfactorio",
                                actions: [MessageBox.Action.YES],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (oAction) { if(oAction=="YES"){
                                    this.limpiar();
                                    this.BackToAprobacion();
                                }}.bind(this)
                            }
                        );
						oGlobalBusyDialog.close();
                    }).catch(error => {
						console.log(error);
						oGlobalBusyDialog.close();
					});
				
			},
			limpiar: function(){
				this.byId("idEstado").setValue("");
			},
			BackToAprobacion: function(){
				this.getRouter().navTo("RouteApp");
                location.reload();
			},
			cancelarEdicion: function() {
				this.limpiar();
                this.getRouter().navTo("RouteApp");
			}
		});
	});

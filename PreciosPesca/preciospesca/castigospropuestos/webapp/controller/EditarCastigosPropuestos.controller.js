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
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController,Controller,JSONModel,History,Link,MessagePopover, MessageItem, MessageToast,MessageBox) {
		"use strict";

        var usuario="";
        //const this.onLocation() = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		return BaseController.extend("tasa.com.castigospropuestos.controller.EditarCastigosPropuestos", {
			onInit: function () {
            this.router = this.getOwnerComponent().getRouter(this);
            this.router.getRoute("EditarCastigosPropuestos").attachPatternMatched(this._onPatternMatched, this);
            let ViewModel= new JSONModel({});
            this.setModel(ViewModel,"dataCastigo")
           
            this._getCurrentUser();

        },
        _getCurrentUser: async function(){
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
            _onPatternMatched: function(oEvent){
                
                this.byId("idPanelInfo").setVisible(true);
                this.byId("tablePrecio").setVisible(true);
                this.byId("PanelMasivo").setVisible(true);
                var oArguments = oEvent.getParameter("arguments");
                var cadena = oArguments.cadena;            
                console.log(cadena);
                this.getView().getModel("CastigosPropuestos");
                console.log(this.getView().getModel("CastigosPropuestos"));
                if(cadena.includes(",")){
                    this.byId("btnGuardar").setVisible(false);
                    this.byId("btnGuardarMasivo").setVisible(true);
                    this.byId("idPanelInfo").setVisible(false);
                    this.byId("PanelMasivo").setVisible(true);
                    var arrayCadena=cadena.split(",");
                    console.log(arrayCadena);
                    var cant=this.getView().getModel("CastigosPropuestos").oData.items.length;
                    var data=[{}];
                    for(var j=0;j<arrayCadena.length;j++){
                        for(var i=0;i<cant;i++){
                            if(i==arrayCadena[j]){
                                
                            data[j]=this.getView().getModel("CastigosPropuestos").oData.items[i];
                            }
                        }
                    }
                 
                    for(var j=0;j<data.length;j++){
                       this.getView().getModel("dataCastigo").setProperty("/items", data);
                       
                    }
                }else{
                    this.byId("btnGuardar").setVisible(true);
                    this.byId("btnGuardarMasivo").setVisible(false);
                    this.byId("tablePrecio").setVisible(false);
                    this.byId("PanelMasivo").setVisible(false);
                    console.log(this.getView().bindElement({path: "CastigosPropuestos>/items/"+ cadena}));
                }
               
                   
    
            },
            edit: function(oEvent){

                var txtCastigo = this.byId("txtCastigo").getValue();
                var txtJuveniles = this.byId("txtJuveniles").getValue();
                var txtObsCastigo = this.byId("txtObsCastigo").getValue();
                var cadena="";
                if(!txtCastigo){
                    cadena+="Debe ingresar % de jueveniles\n";
                }
                if(!txtJuveniles){
                    cadena+="Debe ingresar % de castigo\n";
                }
                if(!txtObsCastigo){
                    cadena+="Debe ingresar Observacion de precios de Castigo\n";
                }
                if(cadena){
                    MessageBox.error(cadena);
                }
                
            },
            goBackAcopio: function(){
                this.byId("idPorcentajePP").setValue("");
                this.getRouter().navTo("RouteApp");
                location.reload();
            },
            editarCastigo: function(){
				
                var idObsCastigo = this.byId("idObsCastigo").getValue();
                var idCastigo = this.byId("idCastigo").getValue();
                var idJuvenil = this.byId("idJuvenil").getValue();
                var idMarea = this.byId("idMarea").getValue();
                var idcodEspecie = this.byId("idcodEspecie").getValue();
                var cadena_str_set=[];
				var body={
                    "p_user": this.usuario,
                    "str_set": [
                      {
                        "cmopt": "NRMAR = "+idMarea+" AND CDSPC = '"+idcodEspecie+"'",
                        "cmset": "PCSPP = '"+idCastigo+"'"+" ESCSG = 'L' USCPP = 'FGARCIA' FHCPP = '20210825' HRCPP = '214807' WAERS = 'USD'",
                        "nmtab": "ZFLPMA"
                      },
                      {
                        "cmopt": "NRMAR = "+idMarea+" AND CDSPC = '"+idcodEspecie+"'",
                        "cmset": "OBCPP = '"+idObsCastigo+"'",
                        "nmtab": "ZFLPMA"
                      }
                    ]
                };

                console.log(body);
				fetch(`${ this.onLocation()}General/Update_Camp_Table`,
                    {
                        method: 'POST',
                        body: JSON.stringify(body)
                    })
                    .then(resp => resp.json()).then(data => {
                        MessageBox.success(
                            "Los datos fueron guardados correctamente ", {
                                icon: MessageBox.Icon.SUCCESS,
                                title: "My message box title",
                                actions: [MessageBox.Action.YES],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (oAction) { if(oAction=="YES"){
                                    this.limpiar();
                                    this.goBackAcopio();
                                }}.bind(this)
                            }
                        ); 
                       
                    }).catch(error => console.log(error)
                    );
				
			},
            guardarAcopioMasivo: function(){
                var tamanioArray=this.getView().getModel("dataCastigo").oData.items.length;
				var data=this.getView().getModel("dataCastigo").oData;
                var idPorcentajePP=this.byId("idPorcentajePP").getValue();
			    console.log(data);
                console.log(tamanioArray);
				var cadena_str_set=[];
				for(var i=0;i<tamanioArray;i++){
					cadena_str_set.push( {
                        "cmopt": "NRMAR = "+data.items[i].NRMAR+" AND CDSPC = '"+data.items[i].CDSPC+"'",
                        "cmset": "PCSPP = '"+idPorcentajePP+"'"+" ESCSG = 'L' USCPP = 'FGARCIA' FHCPP = '20210825' HRCPP = '214807' WAERS = '"+data.items[i].WAERS+"'",
                        "nmtab": "ZFLPMA"
                      },
                      {
                        "cmopt": "NRMAR = "+data.items[i].NRMAR+" AND CDSPC = '"+data.items[i].CDSPC+"'",
                        "cmset": "OBCPP = ''",
                        "nmtab": "ZFLPMA"
                    });
				}
                var body={
                    "p_user": this.usuario,
                    "str_set": cadena_str_set
                };
                console.log(body);
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
                                this.getView().getModel("dataCastigo").setProperty("/items", "");
                                this.byId("idPorcentajePP").setValue("");
                                this.goBackAcopio();
                                
                            }}.bind(this)
                        }
                    ); 
                   
                }).catch(error => console.log(error)
                );
            },
            limpiar: function(){
				
                this.byId("idObsCastigo").setValue("");
                this.byId("idCastigo").setValue("");
                this.byId("idJuvenil").setValue("");
			},
		});
	});

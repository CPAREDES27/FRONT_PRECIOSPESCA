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
        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
        var oGlobalBusyDialog = new sap.m.BusyDialog();
		return BaseController.extend("tasa.com.aprobacioncastigospropuestos.controller.EditarAprobacionCastigos", {
			onInit: function () {
            this.router = this.getOwnerComponent().getRouter(this);
            
            this.router.getRoute("EditarAprobacionCastigos").attachPatternMatched(this._onPatternMatched, this);
            let ViewModel= new JSONModel({});
            this.setModel(ViewModel,"dataCastigo")
            this.loadCombos();
           
            },
            loadCombos:function(){
                oGlobalBusyDialog.open();
               
                
                  let litoral=null;
                  let zdoZinprpDom = null;
                  let zdoTipoMareaDom = null;
                  const bodyDominio = {
                      "dominios": [
                          {
                              "domname": "ZESPRC",
                              "status": "A"
                          }
  
                      ]
                  }
                      fetch(`${mainUrlServices}dominios/Listar`,
                      {
                          method: 'POST',
                          body: JSON.stringify(bodyDominio)
                      })
                      .then(resp => resp.json()).then(data => {
                          console.log(data);
                          zdoTipoMareaDom= data.data.find(d => d.dominio == "ZESPRC").data;
                          this.getView().getModel("Precio").setProperty("/zdoTipoMareaDom", zdoTipoMareaDom);
                          oGlobalBusyDialog.close();
                      }).catch(error => console.log(error)
                      );
                  
              },
            _onPatternMatched: function(oEvent){
                this.byId("idPanelInfo").setVisible(true);
                this.byId("tablePrecio").setVisible(true);
                this.byId("PanelMasivo").setVisible(true);
                var oArguments = oEvent.getParameter("arguments");
                var cadena = oArguments.cadena;            
                console.log(cadena);
                this.getView().getModel("AprobacionCastigosPropuestos");
                console.log(this.getView().getModel("AprobacionCastigosPropuestos"));
                if(cadena.includes(",")){
                    this.byId("btnGuardar").setVisible(false);
                    this.byId("btnGuardarMasivo").setVisible(true);
                    this.byId("idPanelInfo").setVisible(false);
                    this.byId("PanelMasivo").setVisible(true);
                    var arrayCadena=cadena.split(",");
                    console.log(arrayCadena);
                    var cant=this.getView().getModel("AprobacionCastigosPropuestos").oData.items.length;
                    var data=[{}];
                    for(var j=0;j<arrayCadena.length;j++){
                        for(var i=0;i<cant;i++){
                            if(i==arrayCadena[j]){
                                
                            data[j]=this.getView().getModel("AprobacionCastigosPropuestos").oData.items[i];
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
                    console.log(this.getView().bindElement({path: "AprobacionCastigosPropuestos>/items/"+ cadena}));
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
                console.log("GG");
                this.byId("idPorcentajePP").setValue("");
                this.getRouter().navTo("RouteApp");
                location.reload();
            },
            editarCastigo: function(){
				oGlobalBusyDialog.open();
                var idObsCastigo = this.byId("idObsCastigo").getValue();
                var idCastigo = this.byId("idPorcCastigoDef").getValue();                
                var idMarea = this.byId("idMarea").getValue();
                var idcodEspecie = this.byId("idcodEspecie").getValue();
                var moneda = this.byId("idMoneda").getValue();
                var estado = this.byId("cbEstadoPrecio").getSelectedKey();
                var cadena_str_set=[];
				var body={
                    "p_user": "FGARCIA",
                    "str_set": [
                      {
                        "cmopt": "NRMAR = "+idMarea+" AND CDSPC = '"+idcodEspecie+"'",
                        "cmset": "PCCSG = '"+idCastigo+"'"+" ESCSG = '"+estado+"' USCPP = 'FGARCIA' FHCPP = '20210825' HRCPP = '214807' WAERS = '"+moneda+"'",
                        "nmtab": "ZFLPMA"
                      },
                      {
                        "cmopt": "NRMAR = "+idMarea+" AND CDSPC = '"+idcodEspecie+"'",
                        "cmset": "OBCDF = '"+idObsCastigo+"'",
                        "nmtab": "ZFLPMA"
                      }
                    ]
                };

                console.log(body);
				fetch(`${mainUrlServices}General/Update_Camp_Table`,
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
                                    oGlobalBusyDialog.close();
                                    this.getRouter().navTo("RouteApp");
                                    location.reload();
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
                        "cmopt": "NRMAR = "+data.items[i].NRMAR.replace(/^0+/, '')+" AND CDSPC = '"+data.items[i].CDSPC+"'",
                        "cmset": "PCCSG = '"+idPorcentajePP+"'"+" ESCSG = 'N' USCDF = 'FGARCIA' FHCDF = '20210825' HRCDF = '214807'",
                        "nmtab": "ZFLPMA"
                      },
                      {
                        "cmopt": "NRMAR = "+data.items[i].NRMAR.replace(/^0+/, '')+" AND CDSPC = '"+data.items[i].CDSPC+"'",
                        "cmset": "USAPR = 'FGARCIA' FHAPR = '20211018' HRAPR = '081115' ESPRC = 'L'",
                        "nmtab": "ZFLPMA"
                      },
                      {
                        "cmopt": "NRMAR = "+data.items[i].NRMAR.replace(/^0+/, '')+" AND CDSPC = '"+data.items[i].CDSPC+"'",
                        "cmset": "OBCDF = '"+data.items[i].OBCDF+"'",
                        "nmtab": "ZFLPMA"
                      }
                    );
				}
                var body={
                    "p_user": "FGARCIA",
                    "str_set": cadena_str_set
                };
                console.log(body);
                fetch(`${mainUrlServices}General/Update_Camp_Table`,
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
                                this.getView().getModel("dataCastigo").setProperty("/items", "");
                                this.getOwnerComponent().getRouter().navTo("AprobacionCastigos");
                                
                            }}.bind(this)
                        }
                    ); 
                   
                }).catch(error => MessageBox.error("El servicio no está disponible")
                );
            },
            limpiar: function(){
				
                this.byId("idObsCastigo").setValue("");
                this.byId("idPorcCastigoDef").setValue("");
                this.getView().getModel("dataCastigo").setProperty("/items", "");
			},
		});
	});

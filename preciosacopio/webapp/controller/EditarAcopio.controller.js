sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/MessageBox'
],
    function (BaseController, Controller, JSONModel, History, MessageBox) {
        "use strict";
        //const this.onLocation() = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
        var oGlobalBusyDialog = new sap.m.BusyDialog();
        var usuario="";
        return BaseController.extend("tasa.com.preciosacopio.controller.EditarAcopio", {
            _addColumnId: "addLineItem",
            onInit: function () {

                this.router = this.getOwnerComponent().getRouter(this);
                this.router.getRoute("EditarAcopio").attachPatternMatched(this._onPatternMatched, this);
                let ViewModel = new JSONModel({});
                this.setModel(ViewModel, "dataAcopio")

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
            _onPatternMatche: function (oEvent) {
                this.byId("idPanelInfo").setVisible(true);
                this.byId("tablePrecio").setVisible(true);
                var oArguments = oEvent.getParameter("arguments");
                var cadena = oArguments.cadena;
                this.getView().getModel("Acopio");
                this.getView().bindElement({ path: "Acopio>/listaPrecio/" + cadena })
                var cant = this.getView().getModel("Acopio").oData.listaPrecio.length;
                console.log(this.getView().getModel("Acopio").oData);
                console.log(this.getView().getModel("Acopio").oData.listaPrecio);
            },
            _onPatternMatched: function (oEvent) {
                this.byId("idPanelInfo").setVisible(true);
                this.byId("tablePrecio").setVisible(true);
                var oArguments = oEvent.getParameter("arguments");
                var cadena = oArguments.cadena;
                this.getView().getModel("Acopio");
                if (cadena.includes(",")) {
                    this.byId("btnGuardar").setVisible(false);
                    this.byId("btnGuardarMasivo").setVisible(true);
                    this.byId("idPanelInfo").setVisible(false);
                    var arrayCadena = cadena.split(",");
                    console.log(arrayCadena);
                    var cant = this.getView().getModel("Acopio").oData.listaPrecio.length;
                    var data = [{}];
                    for (var j = 0; j < arrayCadena.length; j++) {
                        for (var i = 0; i < cant; i++) {
                            if (i == arrayCadena[j]) {

                                data[j] = this.getView().getModel("Acopio").oData.listaPrecio[i];
                            }
                        }
                    }

                    for (var j = 0; j < data.length; j++) {
                        data[j].OBS="";
                        this.getView().getModel("dataAcopio").setProperty("/items", data);

                    }
                } else {
                    this.byId("btnGuardar").setVisible(true);
                    this.byId("btnGuardarMasivo").setVisible(false);
                    this.byId("tablePrecio").setVisible(false);
                    console.log(this.getView().bindElement({ path: "Acopio>/listaPrecio/" + cadena }));
                }



            },
            guardarAcopioMasivo: function (oEvent) {
                var idPrecioCompra = this.byId("txtPrecioCompra").getValue();
                var fecha = new Date();
                var day = fecha.getDate();
                var anio = fecha.getFullYear();
                var mes = fecha.getMonth() + 1;
                if(mes<10){

                    mes=this.zeroFill(mes,2);

                }

                if(day<10){

                    day=this.zeroFill(day,2);

                }
                var hora = fecha.getHours() + "" + fecha.getMinutes() + "" + fecha.getUTCSeconds();
                fecha = anio + "" + mes + "" + day;
                var tamanioArray = this.getView().getModel("dataAcopio").oData.items.length;
                var arrayAcopio = this.getView().getModel("dataAcopio").oData;

                if(mes<10){

                    mes=this.zeroFill(mes,2);

                }

                if(day<10){

                    day=this.zeroFill(day,2);

                }

                var txtPrecioCompra = this.byId("txtPrecioCompra").getValue();

                if (txtPrecioCompra === "" || txtPrecioCompra === null) {
                    MessageBox.error("El campo 'Precio de Compra' es obligatorio.");
                    return false;
                }
                if (idPrecioCompra <= 0) {
                    MessageBox.error("El precio de compra debe ser mayor a cero.");
                    return false;
                } 
                if(!txtPrecioCompra.includes(".00") && txtPrecioCompra){
                    txtPrecioCompra=txtPrecioCompra.concat(".00");
                }
                
                var estadoPrecio=true;
                for(var i=0; i<arrayAcopio.items.length; i++){

                    var precioTope=arrayAcopio.items[i].PRCTP;
                    var precioCompraMax=arrayAcopio.items[i].PRCMX;

                    if(parseInt(precioTope) < parseInt(idPrecioCompra) || parseInt(precioCompraMax) < parseInt(idPrecioCompra)){
                      
                        estadoPrecio=false;
                       
                    }
                }
                if(!estadoPrecio){
                    for(var i=0; i<arrayAcopio.items.length; i++){

                        arrayAcopio.items[i].OBS="El precio de compra supera al tope permitido";
                        this.getView().getModel("dataAcopio").refresh();
                        
                    }
                    MessageBox.error("No hay precios a aprobar.");
                    return false;
                }
               

                console.log(tamanioArray);
                var cadena_str_bpm = [];
                var cadena_str_ppc = [];
                var array = [];
                var oTable = this.getView().byId("table");
                var oFirstItem;
                for (var i = 0; i < oTable.getItems().length; i++) {
                    oFirstItem = oTable.getItems()[i];
                    var oCell = oFirstItem.getCells()[1];
                    array.push(oCell.getValue());
                }

                for (var i = 0; i < tamanioArray; i++) {
                    console.log(arrayAcopio.items[i]);
                    cadena_str_ppc.push({
                        cmopt: "NRMAR = " + arrayAcopio.items[i].NRMAR.replace(/^(0+)/g, '') + " AND CDSPC = " + "'" + arrayAcopio.items[i].CDSPC + "'",
                        cmset: "ESPRC = " + "'" + arrayAcopio.items[i].ESPRC.substring(0, 1) + "'" + " WAERS = " + "'" + arrayAcopio.items[i].WAERS + "'" + " PRCOM =" + "'" + idPrecioCompra + "'" + " USRPR = 'FGARCIA'" + " FHRPR = " + "'" + fecha + "'" + " HRRPR =" + "'" + "003301" + "'",
                        nmtab: "ZFLPMA"
                    },
                        {
                            cmopt: "NRMAR = " + arrayAcopio.items[i].NRMAR.replace(/^(0+)/g, '') + " AND CDSPC = " + "'" + arrayAcopio.items[i].CDSPC + "'",
                            cmset: "USAPR = 'FGARCIA' FHAPR = " + "'" + fecha + "'" + " HRAPR = " + "'" + "003301" + "'" + " ESPRC = " + "'" + arrayAcopio.items[i].ESPRC.substring(0, 1) + "'",
                            nmtab: "ZFLPMA"
                        });
                    cadena_str_bpm.push({
                        bonif: array[0],
                        cdspc: arrayAcopio.items[i].CDSPC,
                        ebelp: "00000",
                        esbon: "N",
                        fhabo: "00000000",
                        fhrbo: fecha,
                        hrabo: "",
                        hrrbo: "003301",
                        indej: "C",
                        nrbon: "0",
                        nrdes: arrayAcopio.items[i].NRDES,
                        nrmar: arrayAcopio.items[i].NRMAR.replace(/^(0+)/g, ''),
                        usabo: "",
                        usbon: this.usuario
                    });
                }
                console.log(cadena_str_bpm);
                console.log(cadena_str_ppc);

                var bodySave = {
                    "p_cdspc": "",
                    "p_nrdes": "",
                    "p_nrmar": "0",
                    "p_tcons": "A",
                    "p_user": this.usuario,
                    "str_act": cadena_str_ppc,
                    "str_bpm": cadena_str_bpm
                }
                console.log(bodySave);
                fetch(`${ this.onLocation()}preciospesca/AgregarBono`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodySave)
                    })
                    .then(resp => resp.json()).then(data => {
                        MessageBox.success(
                            "Los datos fueron guardados correctamente ", {
                            icon: MessageBox.Icon.SUCCESS,
                            title: "My message box title",
                            actions: [MessageBox.Action.YES],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                                if (oAction == "YES") {
                                    this.limpiar();
                                    this.goBackAcopio();
                                }
                            }.bind(this)
                        }
                        );
                        oGlobalBusyDialog.close();
                    }).catch(error => {
                        console.log(error);
                        oGlobalBusyDialog.close();
                    });
            },
            sendArray: function (oEvent) {


            },
            guardarAcopio: function (oEvent) {
                var precioTope = this.byId("idPrecioTope").getValue();
                var precioCompraMax = this.byId("idPrecioCompraMax").getValue();
                var txtPrecioCompra = this.byId("txtPrecioCompra").getValue();


/*
                if(!txtPrecioCompra.includes(".00") && txtPrecioCompra){
                    txtPrecioCompra=txtPrecioCompra.concat(".00");
                }*/
                if (txtPrecioCompra === "" || txtPrecioCompra === null) {
                    MessageBox.error("El campo 'Precio de Compra' es obligatorio.");
                    return false;
                }
                if(precioTope==0.00 && precioCompraMax==0.00){
                    MessageBox.error("No hay precios a aprobar.");
                    return false;
                }
               
                if (txtPrecioCompra <= 0) {
                    MessageBox.error("El precio de compra debe ser mayor a cero.");
                    return false;
                } 
                if (parseInt(txtPrecioCompra) > parseInt(precioTope) || parseInt(txtPrecioCompra) > parseInt(precioCompraMax)) {
                    MessageBox.error("El precio de compra supera al tope permitido.");
                    return false;

                }
               
                oGlobalBusyDialog.open();
                var marea = this.byId("idMarea").getValue().replace(/^(0+)/g, '');
                var cEspecie = this.byId("idcodEspecie").getValue();
                var idEstado = this.byId("idEstado").getValue().substring(0, 1);
                var idNroDescarga = this.byId("idNroDescarga").getValue();
                var moneda = this.byId("idMoneda").getValue();
                var idPrecioCompra = this.byId("txtPrecioCompra").getValue();
                var fecha = new Date();
                var day = fecha.getDate();
                var anio = fecha.getFullYear();
                var mes = fecha.getMonth() + 1;
                var hora = fecha.getHours() + "" + fecha.getMinutes() + "" + fecha.getUTCSeconds();
                console.log(hora);

                if(mes<10){

                    mes=this.zeroFill(mes,2);

                }

                if(day<10){

                    day=this.zeroFill(day,2);

                }
                fecha = anio + "" + mes + "" + day;
                console.log(fecha);
                var array = [];
                var oTable = this.getView().byId("table");
                console.log(oTable.getItems().length)
                var oFirstItem;
                for (var i = 0; i < oTable.getItems().length; i++) {
                    oFirstItem = oTable.getItems()[i];
                    var oCell = oFirstItem.getCells()[1];
                    array.push(oCell.getValue());
                }

                var cadena_str_ppc = [];
                var cadena_str_bpm = [];

                cadena_str_ppc.push({
                    cmopt: "NRMAR = " + marea + " AND CDSPC = " + "'" + cEspecie + "'",
                    cmset: "ESPRC = " + "'" + idEstado + "'" + " WAERS = " + "'" + moneda + "'" + " PRCOM = " + "'" + idPrecioCompra + "'" + " USRPR = 'FGARCIA'" + " FHRPR = " + "'" + fecha + "'" + " HRRPR =" + "'" + "003301" + "'",
                    nmtab: "ZFLPMA"
                },
                    {
                        cmopt: "NRMAR = " + marea + " AND CDSPC = " + "'" + cEspecie + "'",
                        cmset: "USAPR = 'FGARCIA'" + " FHAPR = " + "'" + fecha + "'" + " HRAPR = " + "'" + hora + "'" + " ESPRC = " + "'" + idEstado + "'",
                        nmtab: "ZFLPMA"
                    });
                console.log(cadena_str_ppc);
                cadena_str_bpm.push({
                    bonif: array[0],
                    cdspc: cEspecie,
                    ebelp: "00000",
                    esbon: "L",
                    fhabo: "00000000",
                    fhrbo: fecha,
                    hrabo: "003301",
                    hrrbo: "003301",
                    indej: "C",
                    nrbon: "0",
                    nrdes: idNroDescarga,
                    nrmar: marea,
                    usabo: "",
                    usbon: this.usuario
                });


                var bodySave = {
                    "p_cdspc": "",
                    "p_nrdes": "",
                    "p_nrmar": "0",
                    "p_tcons": "A",
                    "p_user": this.usuario,
                    "str_act": cadena_str_ppc,
                    "str_bpm": cadena_str_bpm
                }
                console.log(bodySave);
                fetch(`${ this.onLocation()}preciospesca/AgregarBono`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodySave)
                    })
                    .then(resp => resp.json()).then(data => {
                        console.log(data);
                        var cadenita = "";
                        if (data.t_mensaje.length >= 0) {

                            for (var i = 0; i < data.t_mensaje.length; i++) {
                                cadenita += data.t_mensaje[i].DSMIN + "\n";
                            }
                            MessageBox.success(
                                "Los datos de compra fueron guardados correctamente ", {
                                icon: MessageBox.Icon.SUCCESS,
                                title: "Guardado Satisfactorio",
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (oAction) {
                                    if (oAction == "OK") {
                                        MessageBox.error(
                                            cadenita, {
                                            icon: MessageBox.Icon.ERROR,
                                            title: "Error",
                                            actions: [MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) {
                                                if (oAction == "OK") {
                                                    this.limpiar();
                                                    this.goBackAcopio();
                                                }
                                            }.bind(this)
                                        }
                                        );
                                    }
                                }.bind(this)
                            }
                            );


                        }
                        oGlobalBusyDialog.close();
                    }).catch(error => {
                        console.log(error);
                        oGlobalBusyDialog.close();
                    });

            },
            limpiar: function () {
                this.byId("txtPrecioCompra").setValue("");
            },
            onAdd: function (oEvent) {
                var oItem = new sap.m.ColumnListItem({
                    cells: [new sap.m.Input({
                        enabled: false
                    }), new sap.m.Input(), new sap.m.Input({
                        enabled: false

                    }), new sap.m.Button({
                        text: "DELETE",
                        press: [this.remove, this]
                    })]
                });

                var oTable = this.getView().byId("table");
                oTable.addItem(oItem);
            },

            remove: function (oEvent) {
                var oTable = this.getView().byId("table");
                oTable.removeItem(oEvent.getSource().getParent());
            },
            goBackAcopio: function (oEvent) {

                this.getRouter().navTo("RouteApp");
                location.reload();
            },
            zeroFill: function (number, width) {
                width -= number.toString().length;
                if (width > 0) {
                    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
                }
                return number + ""; // siempre devuelve tipo cadena
            },
            holas: function (evn) {
                console.log(evn.mParameters.selectedKey);
            }

        });
    });
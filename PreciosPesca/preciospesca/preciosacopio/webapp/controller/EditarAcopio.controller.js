sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/MessageBox'
],
function (BaseController,Controller,JSONModel,History,MessageBox) {
		"use strict";
        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
        var oGlobalBusyDialog = new sap.m.BusyDialog();
		return BaseController.extend("tasa.com.preciosacopio.controller.EditarAcopio", {
            _addColumnId: "addLineItem",
		onInit: function () {
            
            this.router = this.getOwnerComponent().getRouter(this);
            this.router.getRoute("EditarAcopio").attachPatternMatched(this._onPatternMatched, this);
            let ViewModel= new JSONModel({});
            this.setModel(ViewModel,"dataAcopio")
            
        },
        _onPatternMatche: function(oEvent){
            this.byId("idPanelInfo").setVisible(true);
            this.byId("tablePrecio").setVisible(true);
            var oArguments = oEvent.getParameter("arguments");
            var cadena = oArguments.cadena;
            this.getView().getModel("Acopio");
            this.getView().bindElement({path: "Acopio>/listaPrecio/"+ cadena})
            var cant=this.getView().getModel("Acopio").oData.listaPrecio.length;
            console.log(this.getView().getModel("Acopio").oData);
            console.log(this.getView().getModel("Acopio").oData.listaPrecio);
        },
        _onPatternMatched: function(oEvent){
            this.byId("idPanelInfo").setVisible(true);
            this.byId("tablePrecio").setVisible(true);
            var oArguments = oEvent.getParameter("arguments");
            var cadena = oArguments.cadena;            
            this.getView().getModel("Acopio");
            if(cadena.includes(",")){
                this.byId("btnGuardar").setVisible(false);
                this.byId("btnGuardarMasivo").setVisible(true);
                this.byId("idPanelInfo").setVisible(false);
                var arrayCadena=cadena.split(",");
                console.log(arrayCadena);
                var cant=this.getView().getModel("Acopio").oData.listaPrecio.length;
                var data=[{}];
                for(var j=0;j<arrayCadena.length;j++){
                    for(var i=0;i<cant;i++){
                        if(i==arrayCadena[j]){
                            
                        data[j]=this.getView().getModel("Acopio").oData.listaPrecio[i];
                        }
                    }
                }
             
                for(var j=0;j<data.length;j++){
                   this.getView().getModel("dataAcopio").setProperty("/items", data);
                   
                }
            }else{
                this.byId("btnGuardar").setVisible(true);
                this.byId("btnGuardarMasivo").setVisible(false);
                this.byId("tablePrecio").setVisible(false);
                console.log(this.getView().bindElement({path: "Acopio>/listaPrecio/"+ cadena}));
            }
           
               

        },
        guardarAcopioMasivo: function(oEvent){
            var idPrecioCompra=this.byId("txtPrecioCompra").getValue();
            var fecha= new Date();
            var day= fecha.getDate();
            var anio = fecha.getFullYear();
            var mes = fecha.getMonth()+1;
            var hora= fecha.getHours() +""+ fecha.getMinutes() +""+ fecha.getUTCSeconds();
             fecha=anio+""+mes+""+day;
            var tamanioArray=this.getView().getModel("dataAcopio").oData.items.length;
            var arrayAcopio=this.getView().getModel("dataAcopio").oData;
            console.log(tamanioArray);
            var cadena_str_bpm=[];
            var cadena_str_ppc=[];
            var array=[];
            var oTable = this.getView().byId("table");
            var oFirstItem;
            for(var i=0;i<oTable.getItems().length;i++){
                 oFirstItem= oTable.getItems()[i];
                var oCell = oFirstItem.getCells()[1]; 
                array.push(oCell.getValue()); 
            }
            
            for(var i=0;i<tamanioArray;i++){
                console.log(arrayAcopio.items[i]);
                cadena_str_ppc.push({
                    cmopt: "NRMAR = "+arrayAcopio.items[i].NRMAR.replace(/^(0+)/g, '')+ " AND CDSPC = "+"'"+arrayAcopio.items[i].CDSPC+"'",
                    cmset: "ESPRC = "+"'"+arrayAcopio.items[i].ESPRC.substring(0,1)+"'"+ " WAERS = "+"'"+arrayAcopio.items[i].WAERS+"'"+" PRCOM ="+"'"+idPrecioCompra+"'"+" USRPR = 'FGARCIA'"+" FHRPR = "+"'"+fecha+"'"+" HRRPR ="+"'"+"003301"+"'",
                    nmtab: "ZFLPMA"
                },
                {
                    cmopt: "NRMAR = "+arrayAcopio.items[i].NRMAR.replace(/^(0+)/g, '')+" AND CDSPC = "+"'"+arrayAcopio.items[i].CDSPC+"'",
                    cmset: "USAPR = 'FGARCIA' FHAPR = "+"'"+fecha+"'"+" HRAPR = "+"'"+"003301"+"'"+" ESPRC = "+"'"+arrayAcopio.items[i].ESPRC.substring(0,1)+"'",
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
                    usbon: "FGARCIA"
                });
            }
            console.log(cadena_str_bpm);
            console.log(cadena_str_ppc);

            var bodySave={
                "p_cdspc": "",
                "p_nrdes": "",
                "p_nrmar": "0",
                "p_tcons": "A",
                "p_user": "FGARCIA",
                "str_act": cadena_str_ppc,
                "str_bpm": cadena_str_bpm
            }
            console.log(bodySave);
            fetch(`${mainUrlServices}preciospesca/AgregarBono`,
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
                                onClose: function (oAction) { if(oAction=="YES"){
                                    this.limpiar();
                                    this.goBackAcopio();
                                }}.bind(this)
                            }
                        ); 
                         oGlobalBusyDialog.close();   
                    }).catch(error => console.log(error)
                    );
        },
        sendArray: function(oEvent){
            
            
        },
        guardarAcopio: function(oEvent){
           var precioCompraMax=this.byId("idPrecioCompraMax").getValue();
           var txtPrecioCompra= this.byId("txtPrecioCompra").getValue();
           if(txtPrecioCompra>precioCompraMax){
               MessageBox.error("El precio de compra supera al tope permitido.");
               return false;

           }
           if(txtPrecioCompra<=0){
            MessageBox.error("El precio de compra debe ser mayor a cero.");
            return false;
           }if(txtPrecioCompra==="" || txtPrecioCompra===null){
            MessageBox.error("El campo 'message.PRECIOCOMPRA' es obligatorio.");
            return false;
           }
            oGlobalBusyDialog.open();
            var marea = this.byId("idMarea").getValue().replace(/^(0+)/g, '');
            var cEspecie = this.byId("idcodEspecie").getValue();
            var idEstado = this.byId("idEstado").getValue().substring(0,1);
            var idNroDescarga= this.byId("idNroDescarga").getValue();
            var moneda = this.byId("idMoneda").getValue();
            var idPrecioCompra=this.byId("txtPrecioCompra").getValue();
            var fecha= new Date();
            var day= fecha.getDate();
            var anio = fecha.getFullYear();
            var mes = fecha.getMonth()+1;
            var hora= fecha.getHours() +""+ fecha.getMinutes() +""+ fecha.getUTCSeconds();
           console.log(hora);
           
           if(day<10){
            day=this.zeroFill(day,2)
           }
           fecha=anio+""+mes+""+day;
           console.log(fecha);
            var array=[];
            var oTable = this.getView().byId("table");
            console.log(oTable.getItems().length)
            var oFirstItem;
            for(var i=0;i<oTable.getItems().length;i++){
                 oFirstItem= oTable.getItems()[i];
                var oCell = oFirstItem.getCells()[1]; 
                array.push(oCell.getValue()); 
            }
            
            var cadena_str_ppc=[];
            var cadena_str_bpm=[];

            cadena_str_ppc.push({
                cmopt: "NRMAR = "+marea+ " AND CDSPC = "+"'"+cEspecie+"'",
                cmset: "ESPRC = "+"'"+idEstado+"'"+ " WAERS = "+"'"+moneda+"'"+" PRCOM = "+"'"+idPrecioCompra+"'"+" USRPR = 'FGARCIA'"+" FHRPR = "+"'"+fecha+"'"+" HRRPR ="+"'"+"003301"+"'",
                nmtab: "ZFLPMA"
            },
            {
                cmopt: "NRMAR = "+marea+ " AND CDSPC = "+"'"+cEspecie+"'",
                cmset: "USAPR = 'FGARCIA'"+" FHAPR = "+"'"+fecha+"'"+" HRAPR = "+"'"+hora+"'"+" ESPRC = "+"'"+idEstado+"'",
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
                usbon: "FGARCIA"
            });
            
            
            var bodySave={
                "p_cdspc": "",
                "p_nrdes": "",
                "p_nrmar": "0",
                "p_tcons": "A",
                "p_user": "FGARCIA",
                "str_act": cadena_str_ppc,
                "str_bpm": cadena_str_bpm
            }
            console.log(bodySave);
            fetch(`${mainUrlServices}preciospesca/AgregarBono`,
                    {
                        method: 'POST',
                        body: JSON.stringify(bodySave)
                    })
                    .then(resp => resp.json()).then(data => {
                        console.log(data);
                        var cadenita="";
                        if(data.t_mensaje.length>=0){
                            
                            for(var i=0;i<data.t_mensaje.length;i++){
                                    cadenita+=data.t_mensaje[i].DSMIN+"\n";
                        }
                        MessageBox.success(
                            "Los datos de compra fueron guardados correctamente ", {
                                icon: MessageBox.Icon.SUCCESS,
                                title: "Guardado Satisfactorio",
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK,
                                onClose: function (oAction) { if(oAction=="OK"){
                                    MessageBox.error(
                                        cadenita, {
                                            icon: MessageBox.Icon.ERROR,
                                            title: "Error",
                                            actions: [MessageBox.Action.OK],
                                            emphasizedAction: MessageBox.Action.OK,
                                            onClose: function (oAction) { if(oAction=="OK"){
                                                this.limpiar();
                                                this.goBackAcopio();
                                            }}.bind(this)
                                        }
                                    ); 
                                }}.bind(this)
                            }
                        ); 
                       
                            
                        }
                         oGlobalBusyDialog.close();   
                    }).catch(error => console.log(error)
                    );

        },
        limpiar: function(){
            this.byId("txtPrecioCompra").setValue("");
        },
        onAdd : function(oEvent) {
            var oItem = new sap.m.ColumnListItem({
            cells : [ new sap.m.Input({
                enabled:false
            }),new sap.m.Input(), new sap.m.Input({
                enabled:false

            }), new sap.m.Button({
            text : "DELETE",
            press : [ this.remove, this ]
            }) ]
            });

            var oTable = this.getView().byId("table");
            oTable.addItem(oItem);
        },

        remove : function(oEvent) {
            var oTable = this.getView().byId("table");
            oTable.removeItem(oEvent.getSource().getParent());
        },
        goBackAcopio: function(oEvent){
            
                this.getRouter().navTo("RouteApp");
                location.reload();
        },
        zeroFill: function( number, width )
        {
            width -= number.toString().length;
            if ( width > 0 )
            {
                return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
            }
            return number + ""; // siempre devuelve tipo cadena
        },
        holas: function(evn){
            console.log(evn.mParameters.selectedKey);
        }
        
	});
});
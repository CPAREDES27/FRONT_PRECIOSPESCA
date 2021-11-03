sap.ui.define([
	"./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    'sap/m/Link',
    'sap/m/MessagePopover',
	'sap/m/MessageItem',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    "sap/ui/model/ValidateException",
    "sap/ui/core/Core",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
    
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController,Controller,JSONModel,History,Link,MessagePopover, MessageItem, MessageToast,MessageBox,ValidateException,Core,FilterOperator,ExportTypeCSV,Export) {
		"use strict";
        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
        var oGlobalBusyDialog = new sap.m.BusyDialog();
        var anioActual= new Date();
		return BaseController.extend("com.tasa.politicadeprecios.controller.NuevoPoliticaPrecio", {
			onInit: function () {
                let ViewModel= new JSONModel(
                    {}
                );
                var oView = this.getView(),
				oMM = Core.getMessageManager();
                oMM.registerObject(oView.byId("idPuerto"), true);
                oView.setModel(new JSONModel({ idPuerto : "" }))
                
                 oGlobalBusyDialog.open();
                this.setModel(ViewModel,"metodo");
                this.setModel(ViewModel,"litoral");
                this.setModel(ViewModel,"moneda");
                this.loadCombos();
                this.onChange();  
                this.onChangeMoneda();      
                this.loadPuertos();
                oGlobalBusyDialog.close();
                  
            },
            multiInputPuerto: function(oEvent){
                var valor = this.byId("idPuerto").getValue();
				var data = this.getView().getModel("Puerto");
                var dataLista=data.oData.listaPuertos;
                var array=data.oData.listaPuertos.length;
                var noEncontrado=true;
                console.log(array);
                console.log(dataLista);
                for(var i=0;i<array;i++){
                    if(dataLista[i].CDPTO===valor){
                        this.byId("litoral").setValue(dataLista[i].DSZLT);
                        noEncontrado=true;
                        break;
                    }else{
                        noEncontrado=false;
                    }
                }
                if(!noEncontrado){
                MessageBox.error("la planta no existe");
                        this.byId("idPuerto").setValue("");
                        this.byId("litoral").setValue("");
                    }

            },
            multiInputPlanta: function(oEvent){
                var valor = this.byId("idPlanta").getValue();
				var data = this.getView().getModel("Planta");
                var dataLista=data.oData.listaPlanta;
                var array=data.oData.listaPlanta.length;
                var noEncontrado=true;
                console.log(array);
                console.log(dataLista);
                for(var i=0;i<array;i++){
                    if(dataLista[i].WERKS===valor){
                        this.byId("idPuerto").setValue(dataLista[i].CDPTO);
                        this.byId("litoral").setSelectedKey(dataLista[i].CDZLT);
                        
                        noEncontrado=true;
                        break;
                    }else{
                        noEncontrado=false;
                    }
                }
                if(!noEncontrado){
                MessageBox.error("la planta no existe");
                        this.byId("idPuerto").setValue("");
                        this.byId("litoral").setValue("");
                    }

			},
            loadPuertos: function(){
                var body={
                    "delimitador": "|",
                    "fields": [
                      
                    ],
                    "no_data": "",
                    "option": [
                     {
                       "wa":"ESREG = 'S'"
                     }
                    ],
                    "options": [
                      
                    ],
                    "order": "",
                    "p_user": "FGARCIA",
                    "rowcount": 0,
                    "rowskips": 0,
                    "tabla": "ZV_FLPU"
                  }
                  fetch(`${mainUrlServices}General/Read_Table`,
                    {
                        method: 'POST',
                        body: JSON.stringify(body)
                    })
                    .then(resp => resp.json()).then(data => {
                        console.log(data);
                     
                        
                    }).catch(error => console.log(error)
                    );
            },
            validaInputs:function(){
            var metodo=this.byId("metodo").getSelectedKey();
            var litoral=this.byId("litoral").getSelectedKey();
            var puerto=this.byId("idPuerto").getValue();
            var idPlanta=this.byId("idPlanta").getValue();
            var idArmador=this.byId("idArmadorIni").getValue();
            var idFechaIni=this.byId("idFechaIni").getValue();
            var idFechaFin=this.byId("idFechaFin").getValue();
            var idPrecioMax = this.byId("idPrecioMax").getValue();
            var idPrecioTopeCompra=this.byId("idPrecioTopeCompra").getValue();
            var idPrecioMin=this.byId("idPrecioMin").getValue();
            var idPrecioTopeVenta=this.byId("idPrecioTopeVenta").getValue();
                var estado=true;
                var cadena="";
                console.log(litoral);
        
                if(idPrecioMax== null || idPrecioMax ==""){
                    cadena+="'Precio máx. de compra': El campo 'Precio máx. de compra' es obligatorio \n"
                      this.getView().byId('idPrecioMax').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                  }else{
                    if(idPrecioMax>idPrecioTopeCompra){
                        cadena+="El precio máximo de compra debe ser menor al precio tope de compra \n";
                        this.getView().byId('idPrecioMax').setValueState(sap.ui.core.ValueState.Error);
                        estado=false; 
                        }else{
                            this.getView().byId('idPrecioMax').setValueState();  
                        }
                  }
                  if(idPrecioMin== null || idPrecioMin ==""){
                    cadena+="'Precio min. de venta': El campo 'Precio min. de venta' es obligatorio \n"
                      this.getView().byId('idPrecioMin').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                  }else{
                    if(idPrecioMin<idPrecioTopeVenta){
                        cadena+="El precio mínimo de venta debe ser mayor al precio tope de venta \n";
                        this.getView().byId('idPrecioMin').setValueState(sap.ui.core.ValueState.Error);  
                        estado=false;
                    }else{
                        this.getView().byId('idPrecioMin').setValueState();  
                    }
                  }
           
            if(metodo==null || metodo=="" ){
                cadena+="Debe Ingresar un Método \n";
                this.getView().byId('metodo').setValueState(sap.ui.core.ValueState.Error);  
                estado=false;
            }else{
                this.getView().byId('metodo').setValueState();  
            }
              if(metodo=="ZL" && (litoral==null ||litoral=="")){
                  cadena+="'Zona de litoral': El campo 'Zona de litoral' es obligatorio \n";
                    this.getView().byId('litoral').setValueState(sap.ui.core.ValueState.Error);  
                    estado=false;
                }else{
                    this.getView().byId('litoral').setValueState();  
                }
              if(metodo=="PU"){
                  litoral=this.byId("litoral").getValue();
                  if(litoral==null || litoral==""){
                      cadena+="'Zona de litoral': El campo 'Zona de litoral' es obligatorio \n";
                        this.getView().byId('litoral').setValueState(sap.ui.core.ValueState.Error);  
                        estado=false;
                    }else{
                        this.getView().byId('litoral').setValueState();  
                    }
                  if(puerto==null || puerto==""){
                    cadena+="'Puerto': El campo 'Puerto' es obligatorio"
                      this.getView().byId('idPuerto').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                    }else{
                        this.getView().byId('idPuerto').setValueState();  
                    }
              }
              if(metodo=="PL"){
                  if(litoral==null || litoral==""){
                      cadena+="'Zona de litoral': El campo 'Zona de litoral' es obligatorio \n";;
                        this.getView().byId('litoral').setValueState(sap.ui.core.ValueState.Error);  
                        estado=false
                    }else{
                        this.getView().byId('litoral').setValueState();  
                    }
                  if(puerto==null || puerto==""){
                    cadena+="'Puerto': El campo 'Puerto' es obligatorio \n"
                      this.getView().byId('idPuerto').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                    }else{
                        this.getView().byId('idPuerto').setValueState();  
                    }
                  if(idPlanta==null || idPlanta==""){
                    cadena+="'Planta': El campo 'Planta' es obligatorio \n"
                      this.getView().byId('idPlanta').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                    }else{
                        this.getView().byId('idPlanta').setValueState();  
                    }
              }
              if(metodo=="AC"){
                  if(litoral==null || litoral==""){
                      cadena+="'Zona de litoral': El campo 'Zona de litoral' es obligatorio \n";
                        this.getView().byId('litoral').setValueState(sap.ui.core.ValueState.Error);  
                        estado=false;
                    }else{
                        this.getView().byId('litoral').setValueState();  
                    }
                  if(puerto==null || puerto==""){
                    cadena+="'Puerto': El campo 'Puerto' es obligatorio \n"
                      this.getView().byId('idPuerto').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                    }else{
                        this.getView().byId('idPuerto').setValueState();  
                    }
                  if(idPlanta==null || idPlanta==""){
                    cadena+="'Planta': El campo 'Planta' es obligatorio \n"
                      this.getView().byId('idPlanta').setValueState(sap.ui.core.ValueState.Error);  
                      estado=false;
                    }else{
                        this.getView().byId('idPlanta').setValueState();  
                    }
                   if(idArmador==null || idArmador==""){
                     cadena+="'Armador': El campo 'Armador' es obligatorio \n"
                       this.getView().byId('idArmadorIni').setValueState(sap.ui.core.ValueState.Error);  
                       estado=false;
                     }else{
                         this.getView().byId('idArmadorIni').setValueState();  
                     }
              }
              console.log(idFechaIni.length);
              if(idFechaIni== null || idFechaIni ==""){
                  cadena+="'Fecha de inicio': El campo 'Fecha de inicio' es obligatorio \n"
                
                    this.getView().byId('idFechaIni').setValueState(sap.ui.core.ValueState.Error);  
                    estado=false;
                }else{
                    if(idFechaIni.length===8 ){
                    
                        this.getView().byId('idFechaIni').setValueState();   
                    }
                    else{
                        
                        cadena+="Fecha inicio: Ingrese una fecha valida \n"
                        this.getView().byId('idFechaIni').setValueState(sap.ui.core.ValueState.Error);
                        estado=false;
                    }
                    
                    
                }
              if(idFechaFin== null || idFechaFin ==""){
                  cadena+="'Fecha de fin': El campo 'Fecha de fin' es obligatorio \n"
                  
                    this.getView().byId('idFechaFin').setValueState(sap.ui.core.ValueState.Error);  
                    estado=false;
                }else{
                    if(idFechaFin.length!=8 ){
                        cadena+="Fecha inicio: Ingrese una fecha valida \n"
                        this.getView().byId('idFechaFin').setValueState(sap.ui.core.ValueState.Error);
                        estado=false;
                    }else{
                        this.getView().byId('idFechaFin').setValueState();
                    }
                }
              
              if(idPrecioTopeCompra== null || idPrecioTopeCompra ==""){
                  cadena+="'Precio tope de compra': El campo 'Precio tope de compra' es obligatorio \n"
                    this.getView().byId('idPrecioTopeCompra').setValueState(sap.ui.core.ValueState.Error);  
                    estado=false;
                }else{
                    this.getView().byId('idPrecioTopeCompra').setValueState();  
                }
              
              if(idPrecioTopeVenta== null || idPrecioTopeVenta ==""){
                  cadena+="'Precio tope de venta': El campo 'Precio tope de venta' es obligatorio \n"
                    this.getView().byId('idPrecioTopeVenta').setValueState(sap.ui.core.ValueState.Error);  
                    estado=false;
                }else{
                    this.getView().byId('idPrecioTopeVenta').setValueState();  
                }
              if(estado==false){
                MessageBox.error(cadena);
              }
              
              return estado;
              
            },
            myCallback: function(){
               if(this.validaInputs()){
                   this.enviarDataGuardar();
               }else{
                   console.log("adios")
               }
            },
            // onNameChange2: function(oEvent) {
            //     var oInput = oEvent.getSource();
            //     this._validateInput2(oInput);
            // },
            // _validateInput2: function (oInput) {
            //     var sValueState = "None";
            //     var bValidationError = false;
            //     var oBinding = oInput.getBinding("value");
            //     try {
            //         var fecha=oBinding.oValue;
            //         var fechas =fecha.substring(0,4);
            //         console.log(fecha);
            //         if(fecha.length===8){
            //             oBinding.getType().validateValue(oInput.getValue());
            //             bValidationError = true;
            //         }else{
            //             sValueState = "Error";
            //             bValidationError = true;
            //         }
            //     } catch (oException) {
            //         sValueState = "Error";
            //         bValidationError = true;
            //     }
    
            //     oInput.setValueState(sValueState);
    
            //     return bValidationError;
            // },
            onNameChange: function(oEvent) {
                var oInput = oEvent.getSource();
                this._validateInput(oInput);
            },
            _validateInput: function (oInput) {
                var sValueState = "None";
                var bValidationError = false;
                var oBinding = oInput.getBinding("value");
                try {
                    
                        oBinding.getType().validateValue(oInput.getValue());
                    
                } catch (oException) {
                    sValueState = "Error";
                    bValidationError = true;
                }
    
                oInput.setValueState(sValueState);
    
                return bValidationError;
            },
            enviarDataGuardar: function(){
                
                oGlobalBusyDialog.open();
                var date = new Date();
				console.log(date.getHours() +" "+ date.getMinutes() +" "+ date.getSeconds());
				var hora= date.getHours();
				var minutos = date.getMinutes();
				var segundos = date.getSeconds();
				if(hora<10){
					hora = this.zeroFill(hora,2);
				}if(minutos<10){
					minutos=this.zeroFill(minutos,2);
				}
				if(segundos<10){
					segundos=this.zeroFill(segundos,2);
				}
				var horaTotal=hora+""+minutos+""+segundos;
                var metodo=this.byId("metodo").getSelectedKey();
                var litoral=this.byId("litoral").getSelectedKey();
                var puerto=this.byId("idPuerto").getValue();
                var idPlanta=this.byId("idPlanta").getValue();
                var idFechaIni=this.byId("idFechaIni").getValue();
                var idFechaFin=this.byId("idFechaFin").getValue();
                var idPrecioMax=this.byId("idPrecioMax").getValue();
                var idPrecioTopeCompra=this.byId("idPrecioTopeCompra").getValue();
                var idPrecioMin=this.byId("idPrecioMin").getValue();
                var idPrecioTopeVenta=this.byId("idPrecioTopeVenta").getValue();
                var idEspecie  = this.byId("idEspecieIni").getValue();
                var idEstadoPrecio  = this.byId("idEstadoPrecio").getValue();
                var metodos=this.byId("metodo").getSelectedItem().getText();
                if(this.byId("metodo")!="ZL"){
                    var litorals=this.byId("litoral").getValue();
                }else{
                    var litorals=this.byId("litoral").getSelectedItem().getText();
                }
                var idArmador=this.byId("idArmadorIni").getValue();
                var moneda  = this.byId("moneda").getValue();
                var campo="";
                var data = this.getView().getModel("Planta");
                var dataLista=data.oData.listaPlanta;
                var array=data.oData.listaPlanta.length;
                for(var i=0;i<array;i++){
                    if(dataLista[i].WERKS===idPlanta){
                
                        idPlanta= dataLista[i].CDPTA;
                     
                        break;
                    }else{
                        
                    }
                }
                console.log(metodo);
                console.log(litoral);
                console.log(puerto);
                console.log(idPlanta);
                console.log(idFechaIni);
                console.log(idFechaFin);
                console.log(idPrecioMax);
                console.log(idPrecioTopeCompra);
                console.log(idPrecioMin);
                console.log(idPrecioTopeVenta);
                console.log(idEspecie);
                //console.log(idArmador);
                console.log(moneda);
                
                
                console.log("Moneda "+ moneda);
                if(moneda==="- DOLARES AMERICANOS"){
                    moneda="USD";
                     console.log("Moneda "+ moneda);
                }
                // if(!idArmador){
                //     console.log("ID ARMADOR"+ idArmador);
                //     idArmador="";
                //     console.log("ID "+ idArmador);
                // }
                // if(!idArmador){
                //     console.log("ID ARMADOR"+ idArmador);
                //     idPlanta="";
                //     console.log("ID "+ idArmador);
                // }
                // if(!idArmador){
                //   idPlanta="";
                // }
                if(metodo==="ZL" || metodo==="PU")
                {
                 campo="X";   
                }
                
                const bodyGuardar={
                        "p_campo": campo,
                        "p_indtr": "C",
                        "p_user": "FGARCIA",
                        "str_ppc": [
                            {
                            "atcrn": "FGARCIA",
                            "cdemp": idArmador,
                            "cdppc": "",
                            "cdpta": idPlanta,
                            "cdpto": puerto,
                            "cdspc": idEspecie,
                            "cdzlt": litoral,
                            "espmr": "L",
                            "ffvig": idFechaFin,
                            "fhcrn": idFechaFin,
                            "fivig": idFechaIni,
                            "hrcrn": horaTotal,
                            "mandt": "",
                            "prcmx": idPrecioMax,
                            "prctp": idPrecioTopeCompra,
                            "prvmn": idPrecioMin,
                            "prvtp": idPrecioTopeVenta,
                            "waers": moneda
                            }
                        ]
                    }


                    fetch(`${mainUrlServices}preciospesca/Mant`,
                     {
                         method: 'POST',
                         body: JSON.stringify(bodyGuardar)
                         
                     })
                     .then(resp => resp.json() ).then(data => {
                         console.log(data.t_mensaje);
                         if(data.t_mensaje.length<=0){
                             console.log(data);
                             //MessageBox.success("Los datos fueron guardados correctamente \n"+"Método: "+metodos+"\n"+"Zona Litoral: "+litorals+"\n"+"Puerto: "+puerto+" "+litorals+"\n"+"Planta: "+idPlanta+" "+ litorals);
                             MessageBox.success(
                                 "Los datos fueron guardados correctamente \n"+"Método: "+metodos+"\n"+"Zona Litoral: "+litorals+"\n"+"Puerto: "+puerto+" "+litorals+"\n"+"Planta: "+idPlanta+" "+ litorals+ "\n\n\n ¿Desea Registrar otro?", {
                                     icon: MessageBox.Icon.SUCCESS,
                                     title: "Guardado satisfactorio",
                                     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                                     emphasizedAction: MessageBox.Action.YES,
                                     onClose: function (oAction) { if(oAction=="YES"){
                                        this.limpiar();
                                     }else{
                                        this.regresarMain();
                                     }}.bind(this)
                                 }
                             ); 
                         }else{
                             console.log("ERROR \n");
                             var datas= data.t_mensaje;
                             var messsage="";
                            for(var i=0;i<datas.length;i++){
                                console.log(datas[i].DSMIN);
                                messsage+= datas[i].DSMIN+ " \n";
                            }
                             MessageBox.error(
                                 messsage, {
                                     icon: MessageBox.Icon.ERROR,
                                     title: "Error",
                                     actions: [MessageBox.Action.OK],
                                     emphasizedAction: MessageBox.Action.OK,
                                     onClose: function (oAction) { if(oAction=="OK"){
                                        
                                     }else{
                                          this.getOwnerComponent().getRouter().navTo("PoliticaPrecios");
                                     }}.bind(this)
                                 }
                             ); 
                         }
                          oGlobalBusyDialog.close();
                        
                     }).catch(error => console.log(error)
                     );oGlobalBusyDialog.close();            },
            limpiar: function(){
                 this.byId("metodo").setValue("");
                 this.byId("litoral").setValue("");
                 this.byId("idPuerto").setValue("");
                 this.byId("idPlanta").setValue("");
                 this.byId("idArmadorIni").setValue("");
                 this.byId("idFechaIni").setValue("");
                 this.byId("idFechaFin").setValue("");
                 this.byId("idPrecioMax").setValue("");
                 this.byId("idPrecioTopeCompra").setValue("");
                 this.byId("idEspecieIni").setValue("");
                 this.byId("idPrecioMin").setValue("");
                 this.byId("idPrecioTopeVenta").setValue("");
                 this.byId("idLitoralForm").setVisible(false);
                 this.byId("litoral").setEnabled(true);
                 this.byId("idPuertoForm").setVisible(false);
                 this.byId("idPlantaForm").setVisible(false);
                 this.byId("idArmadorForm").setVisible(false);
            },
            regresarMain: function(event){
                this.limpiar();
                this.getRouter().navTo("RouteApp");
                location.reload();
            }
            ,
            guardar: function(event){
               MessageBox.confirm(
                    "¿Desea guardar el registro?", {
                        icon: MessageBox.Icon.INFORMATION,
                        title: "Guardar Política de Precio",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) { if(oAction=="YES"){
                            this.myCallback();
                        }else{
                            
                        }}.bind(this)
                    }
                );                
            },
            onChangeMoneda: function(oEvent){
                 let valorMetodo = this.byId("moneda").getSelectedKey();
                console.log(valorMetodo);
            },
            onChange: function(oEvent){
                
                this.getView().byId('metodo').setValueState();  
                this.getView().byId('litoral').setValueState();  
                this.getView().byId('idPuerto').setValueState();
                this.getView().byId('idPlanta').setValueState();
              
                let valorMetodo = this.byId("metodo").getSelectedKey();
                let valorLitoral = this.byId("litoral").getSelectedKey();
                let valorPuerto =this.byId("idPuerto").getSelectedKey();
                let valoridPlanta = this.byId("idPlanta").getSelectedKey();
               // let valoridArmador =this.byId("idArmador").getSelectedKey();
                if(valorMetodo){
                    this.getView().byId('metodo').setValueState();  
                }
                if(valorLitoral){
                    this.getView().byId('litoral').setValueState();  
                }
                if(valorPuerto){
                    this.getView().byId('idPuerto').setValueState();
                    
                }
                if(valoridPlanta){
                    this.getView().byId('idPlanta').setValueState();  
                }
                
                
                if(valorMetodo==="PU"){
                    this.byId("litoral").setValue("");
                    this.getView().byId('idPuerto').setValueState(sap.ui.core.ValueState.Information);
                }
                if(valorMetodo==="PL"){
                    this.byId("litoral").setValue("");
                    this.byId("idPuerto").setValue("");
                    this.getView().byId('idPuerto').setValueState(sap.ui.core.ValueState.Information);
                    this.getView().byId('idPlanta').setValueState(sap.ui.core.ValueState.Information);
                }
                if(valorMetodo==="AC"){
                    this.byId("litoral").setValue("");
                    this.byId("idPuerto").setValue("");
                    this.byId("idPlanta").setValue("");
                }
                
                console.log(valorMetodo);
                if(!valorMetodo){
                    this.ocultarForm();
                }else if(valorMetodo==="ZL"){
                    this.byId("litoral").setValue("");
                    this.byId("idLitoralForm").setVisible(true);
                    this.byId("litoral").setEnabled(true);
                    this.byId("idPuertoForm").setVisible(false);
                    this.byId("idPlantaForm").setVisible(false);
                    this.byId("idArmadorForm").setVisible(false);
                }else if(valorMetodo==="PU"){
                    this.byId("idPuerto").setValue("");
                    this.byId("idLitoralForm").setVisible(true);
                    this.byId("idPlanta").setVisible(true);
                    this.byId("litoral").setEnabled(false);
                    this.byId("idPuerto").setEnabled(true);
                    this.byId("idPuertoForm").setVisible(true);
                    this.byId("idPlantaForm").setVisible(false);
                    this.byId("idArmadorForm").setVisible(false);
                }else if(valorMetodo==="PL"){
                    this.byId("idLitoralForm").setVisible(true);
                    this.byId("litoral").setEnabled(false);
                    this.byId("idPuerto").setEnabled(false);
                    //this.byId("idPlanta").setEnabled(false);
                    this.byId("idPlanta").setValue("");
                    this.byId("idPuertoForm").setVisible(true);
                    this.byId("idPlantaForm").setVisible(true);
                    this.byId("idArmadorForm").setVisible(false);
                }else if(valorMetodo==="AC"){
                    this.byId("idLitoralForm").setVisible(true);
                    this.byId("idPuertoForm").setVisible(true);
                    this.byId("idPlantaForm").setVisible(true);
                    this.byId("idArmadorForm").setVisible(true);
                    this.byId("litoral").setEnabled(false);
                    this.byId("idPuerto").setEnabled(false);
                   // this.byId("litoral").setEnabled(false);
                    //this.byId("idPuerto").setEnabled(false);
                    //this.byId("idPlanta").setEnabled(false);
                    //this.byId("idArmador").setEnabled(false);
                }

            },
            ocultarForm:function(){
                this.byId("idLitoralForm").setVisible(false);
                this.byId("idArmadorForm").setVisible(false);
                this.byId("idPuertoForm").setVisible(false);
                this.byId("idPlantaForm").setVisible(false);
            },
            loadCombos:function(){
              
                let litoral=null;
                let moneda = null;
                let metodo = null;
                let cboLitoral=null;
                const bodyDominio = {
                    "dominios": [
                        {
                            "domname": "MONEDA"
                        },
                        {
                            "domname": "ZDO_METODO",
                            "status": "A"
                        },
                        {
                            "domname": "LITORAL"
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
                        moneda = data.data.find(d => d.dominio == "MONEDA").data;
                        metodo= data.data.find(d => d.dominio == "ZDO_METODO").data;
                        cboLitoral= data.data.find(d => d.dominio == "LITORAL").data;
                        this.getModel("metodo").setProperty("/lista", metodo);
                        this.getModel("litoral").setProperty("/listas",cboLitoral);
                        this.getModel("moneda").setProperty("/mLista",moneda);
                     
                        
                    }).catch(error => console.log(error)
                    );
               
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
            _onOpenDialogArmador: function(evn) {
				
				this.popUp=evn;
				this.getView().getModel("Armador").setProperty("/listaArmador","");
				this._getDialogArmador().open();
			},
	
			_onCloseDialogArmador: function() {
				this._getDialogArmador().close();
				sap.ui.getCore().byId("idRuc2").setValue("");
				sap.ui.getCore().byId("idDescripcion").setValue("");
				sap.ui.getCore().byId("idCuentaProveedor").setValue("");
				sap.ui.getCore().byId("idListaArmador").setText("Lista de registros:");
				
			},
	
			_getDialogArmador : function () {
				if (!this._oDialogArmador) {
					this._oDialogArmador = sap.ui.xmlfragment("com.tasa.politicadeprecios.view.DlgArmador", this.getView().getController());
					this.getView().addDependent(this._oDialogArmador);
					sap.ui.getCore().byId("idAciertosPop").setValue("200");
				}
				
				return this._oDialogArmador;
			},
			buscar: function(evt){
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Armador.sPath.split("/")[2];
				console.log(indices);
				var data = this.getView().getModel("Armador").oData.listaArmador[indices].LIFNR;
				
					this.byId("idArmadorIni").setValue(data);
				
				
				this._onCloseDialogArmador();	
			},
            listaArmador: function(){
				oGlobalBusyDialog.open();
				var body={
					"codigo": "100"
				  }
				  fetch(`${mainUrlServices}General/Armador`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataPuerto=data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Armador").setProperty("/listaArmador",dataPuerto));
				
							oGlobalBusyDialog.close();
					
						
						
					  }).catch(error => console.log(error)
					  );
			},
			

		});
	});

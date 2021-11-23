sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,MessageBox,Filter,FilterOperator,Export,ExportTypeCSV) {
		"use strict";
        const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var popEmb="";
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		return BaseController.extend("tasa.com.aprobacioncastigospropuestos.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
					{}
					);
					var oGlobalBusyDialog = new sap.m.BusyDialog();
					this.setModel(ViewModel,"litoral");
					this.setModel(ViewModel,"precio");
					this.setModel(ViewModel,"reporteCala")
					this.byId("idAciertos").setValue("200");
					this.listPlanta();
					
			},

			goBackMain: function () {
				   this.getRouter().navTo("RouteApp");
				   location.reload();
		   },
		   buscarFecha: function(oEvent){
			  
			var dateIni= new Date(oEvent.mParameters.from);
			var dateIni2 = new Date(oEvent.mParameters.to);
			if(oEvent.mParameters.from==null){
				dateIni="";	
			}
			if(oEvent.mParameters.to==null){
				dateIni2="";	
			}
			var id=oEvent.mParameters.id;
			var fechaIni="";
			var fechaIni2="";
			if(dateIni){
				 fechaIni=this.generateFecha(dateIni);
			}
			if(dateIni2){
				 fechaIni2=this.generateFecha(dateIni2);
			}

			
			if(id==="application-aprobacioncastigospropuestos-display-component---App--idFechaIniVigencia")
			{
				JsonFechaIni={
					fechaIni:fechaIni,
					fechaIni2:fechaIni2
				}
			}	 
		},
		generateFecha: function(date){
		  var day=date.getDate();
		  var anio=date.getFullYear();
		  var mes=date.getMonth()+1;
		  if(mes<10){
			  mes=this.zeroFill(mes,2);
		  }
		  if(day<10){
			  day=this.zeroFill(day,2);
		  }
		  var fecha= anio.toString()+mes.toString()+day.toString();
		 
		 
		  return fecha;
	  },
		   
		   loadTablaPreciosAcopio: function(){
				oGlobalBusyDialog.open();
			   let idPlantaIni = this.byId("idPlantaIni").getValue();
			   let idPlantaFin= this.byId("idPlantaFin").getValue();
			   let idEmbarcacionIni = this.byId("idEmbarcacionIni").getValue();
			   let idEmbarcacionFin =this.byId("idEmbarcacionFin").getValue();
			   
			   let radio1 = this.byId("rbgtype").getSelectedButton().getText();
			   let idAciertos =this.byId("idAciertos").getValue();
			   let options=[];
			   let idEstado="";
			   if(!idAciertos){
				  MessageBox.error("Debe ingresar cantida de aciertos");
				  return false;
			   }
			   if(radio1 ==="Pendientes de castigo"){
				   console.log("entró");
				   idEstado="PC";
			   }
			   if(idPlantaIni || idPlantaFin){
				   options.push({
					   cantidad: "10",
					   control:"MULTIINPUT",
					   key:"WERKS",
					   valueHigh: idPlantaFin,
					   valueLow:idPlantaIni
				   });
			   }
			   if(idEmbarcacionIni || idEmbarcacionFin){
				   options.push({
					   cantidad: "10",
					   control:"MULTIINPUT",
					   key:"CDEMB",
					   valueHigh: idEmbarcacionFin,
					   valueLow:idEmbarcacionIni
				   });
			   }
			   if(JsonFechaIni.fechaIni || JsonFechaIni.fechaIni2){
				   options.push({
					   cantidad: "10",
					   control:"MULTIINPUT",
					   key:"FECCONMOV",
					   valueHigh: JsonFechaIni.fechaIni2,
					   valueLow:JsonFechaIni.fechaIni
				   });
			   }
			   
			   console.log(radio1);
			   
				 let body = {
					"id_estado": idEstado,
					"num_application": 1,
					"p_calidad": "TMP-HP34",
					"p_flag": "X",
					"p_indpr": "C",
					"p_option": [],
					"p_options": options,
					"p_rows": idAciertos,
					"p_user": "FGARCIA"
				   }
				   var indice=-1;
				   console.log(body);
				  fetch(`${mainUrlServices}preciospesca/ConsultarPrecioMar`,
					   {
						   method: 'POST',
						   body: JSON.stringify(body)
					   })
					   .then(resp => resp.json()).then(data => {
							console.log(data.str_pm)
						   for(var valor in data.str_pm){
							   if(data.str_pm[valor].WAERS==="USD"){
								   data.str_pm[valor].WAERSDESC="- DOLARES AMERICANOS";
							   }
							   if(data.str_pm[valor].NRMAR){
								 data.str_pm[valor].NRMAR= this.zeroFill(data.str_pm[valor].NRMAR,10);
							   this.getModel("AprobacionCastigosPropuestos").setProperty("/items", data.str_pm);
							   }
						   }
						   data.str_pm.total=data.str_pm.length;
						   this.byId("title").setText("Lista de registros: "+data.str_pm.total);
						   oGlobalBusyDialog.close();
					   }).catch(error => console.log(error)
					   );
		   },
		   listaEmbarcacion: function(){
			   var body={
				   "option": [
					
				   ],
				   "option2": [],
				   "options": [
					 {
						cantidad: "10",
						control:"MULTIINPUT",
						key:"ESEMB",
						valueHigh: "",
						valueLow: "O"
					 }
				   ],
				   "options2": [
					
				   ],
				   "p_user": "BUSQEMB"
				 }
				 fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
					 {
						 method: 'POST',
						 body: JSON.stringify(body)
					 })
					 .then(resp => resp.json()).then(data => {
					   var dataPuerto=data.data;
					   console.log(dataPuerto);
					   console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
					 }).catch(error => console.log(error)
					 );
		   },
		   listPlanta: function(){
			   var dataPlantas={
				   "delimitador": "|",
				   "fields": [
					
				   ],
				   "no_data": "",
				   "option": [],
				   "options": [
					{
                        cantidad: "20",
                        control:"MULTIINPUT",
                        key:"INPRP",
                        valueHigh: "",
                        valueLow:"P"
                    },
					{
                        cantidad: "20",
                        control:"MULTIINPUT",
                        key:"ESREG",
                        valueHigh: "",
                        valueLow:"S"
                    }
				   ],
				   "order": "",
				   "p_user": "FGARCIA",
				   "rowcount": 0,
				   "rowskips": 0,
				   "tabla": "ZV_FLPL"
				 }
				 fetch(`${mainUrlServices}General/Read_Table`,
				 {
					 method: 'POST',
					 body: JSON.stringify(dataPlantas)
				 })
				 .then(resp => resp.json()).then(data => {
				   var dataPuerto=data.data;
				   
				   console.log(this.getView().getModel("Planta").setProperty("/listaPlanta",dataPuerto));
				 }).catch(error => console.log(error)
				 );
			   
		   },
		   editRow: function(oEvent){
			   console.log("HOLA");
			   var cadena=oEvent.getSource().getBindingContext("AprobacionCastigosPropuestos").getPath().split("/")[2];
			   console.log(cadena);
			   this.getRouter().navTo("EditarAprobacionCastigos",{cadena});
			   
			  
		   },
		   editarMasivo: function(oEvent){
			 var indices = this.byId("table").getSelectedIndices();
			 var cadena ="";
			 for(var i=0;i<indices.length;i++){
				 cadena += indices[i]+",";
			 }
			 var cadena=cadena.substring(0,cadena.length-1)
			 console.log(cadena);
			  this.getRouter().navTo("EditarAprobacionCastigos",{cadena});
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
		   filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("NRMAR", FilterOperator.Contains, sQuery),
					new Filter("NRDES", FilterOperator.Contains, sQuery),
					new Filter("DESCR", FilterOperator.Contains, sQuery),
					new Filter("CDSPC", FilterOperator.Contains, sQuery),
					new Filter("FIDES", FilterOperator.Contains, sQuery),
					new Filter("HIDES", FilterOperator.Contains, sQuery),
					new Filter("FFDES", FilterOperator.Contains, sQuery),
					new Filter("HFDES", FilterOperator.Contains, sQuery),
					new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
					new Filter("NMEMB", FilterOperator.Contains, sQuery),
					
					
				], false);
			}

			this._filter();
		},
		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("table").getBinding().filter(oFilter, "Application");
		},
		listaEmbarcacion: function(){
			oGlobalBusyDialog.open();
			console.log("BusquedaEmbarca");
			var idEmbarcacion =sap.ui.getCore().byId("idEmbarcacion").getValue();
			var idEmbarcacionDesc =sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
			var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
			var idRuc =sap.ui.getCore().byId("idRuc").getValue();
			var idArmador =sap.ui.getCore().byId("idArmador").getValue();
			var idPropiedad = sap.ui.getCore().byId("idPropiedad").getSelectedKey();

			var options=[];
			var options2=[];
			options.push({
				"cantidad": "20",
				"control": "COMBOBOX",
				"key": "ESEMB",
				"valueHigh": "",
				"valueLow": "O"
			})
			if(idEmbarcacion){
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacion
					
				});
			}
			if(idEmbarcacionDesc){
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacionDesc
					
				});
			}
			if(idMatricula){
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "MREMB",
					"valueHigh": "",
					"valueLow": idMatricula
				})
			}
			if(idPropiedad){
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "INPRP",
					"valueHigh": "",
					"valueLow": idPropiedad
				})
			}
			if(idRuc){
				options2.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": idRuc
				})
			}
			if(idArmador){
				options2.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "NAME1",
					"valueHigh": "",
					"valueLow": idArmador
				})
			}
			
			var body={
				"option": [
				  
				],
				"option2": [
				  
				],
				"options": options,
				"options2": options2,
				"p_user": "BUSQEMB"
			  }
			  console.log(body);
			fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					  console.log(data);
					var dataPuerto=data.data;
					console.log(dataPuerto);
					console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
					
						sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: "+dataPuerto.length);
					if(dataPuerto.length<=0){
						sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: No se encontraron resultados");
					}
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
			);
		},
		loadIndicadorP: function(){
			oGlobalBusyDialog.open();
			var ZINPRP=null;
			var body={
				"dominios": [
				  {
					"domname": "ZINPRP",
					"status": "A"
				  }
				]
			}
			fetch(`${mainUrlServices}dominios/Listar/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					console.log(data);
						
					ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
						
						this.getModel("Propiedad").setProperty("/listaPropiedad", ZINPRP);
						oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
			);

		},
		buscarEmbarca: function(evt){
			console.log(evt);
			var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
			console.log(indices);
			var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
			if (this.currentInputEmba.includes("embarcacionLow")) {
				this.byId("idEmbarcacionIni").setValue(data);
			}else if(this.currentInputEmba.includes("embarcacionHigh")){
				this.byId("idEmbarcacionFin").setValue(data);
			}
			
			this._onCloseDialogEmbarcacion();
			
		},
		_onOpenDialogEmbarcacion: function(popup) {

			this.popEmb=popup;
			this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion","");
			this._getDialogEmbarcacion().open();
			
			},

			_onCloseDialogEmbarcacion: function() {
				this._getDialogEmbarcacion().close();
			},

			_getDialogEmbarcacion : function () {
				if (!this._oDialogEmbarcacion) {
					this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.aprobacioncastigospropuestos.view.DlgEmbarcacion", this.getView().getController());
					this.getView().addDependent(this._oDialogEmbarcacion);
				}
				sap.ui.getCore().byId("idEmbarcacion").setValue("");
			sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
			sap.ui.getCore().byId("idMatricula").setValue("");
			sap.ui.getCore().byId("idRuc").setValue("");
			sap.ui.getCore().byId("idArmador").setValue("");
				return this._oDialogEmbarcacion;
			}

		});
	});

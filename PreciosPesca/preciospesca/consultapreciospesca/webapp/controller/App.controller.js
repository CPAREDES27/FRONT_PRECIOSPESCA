sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	 function (BaseController,Controller,JSONModel,History,ExportTypeCSV,Export,Filter,FilterOperator) {
		"use strict";
		const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var JsonFechaIni={
			fechaIni:"",
			fechaIni2:""
		};
		var popEmb="";
		var popUp="";
		return BaseController.extend("tasa.com.consultapreciospesca.controller.App", {
			onInit: function () {
				let ViewModel= new JSONModel(
					{}
					);
					var oGlobalBusyDialog = new sap.m.BusyDialog();
					this.setModel(ViewModel,"litoral");
					this.setModel(ViewModel,"precio");
					this.setModel(ViewModel,"castigo");
					this.setModel(ViewModel,"reporteCala")
					this.loadComboPrecio(); 
					this.listPlanta();
					this.loadIndicadorP();
					this.listaArmador();
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
   
				debugger;
				if(id==="application-consultapreciospesca-display-component---App--idFechaIniVigencia")
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
			listPlanta: function(){
				oGlobalBusyDialog.open();
				var dataPlantas={
					"delimitador": "|",
					"fields": [
					 
					],
					"no_data": "",
					"option": [
					  {
						"wa":"INPRP = 'P'"
						},
						{
						"wa":"AND ESREG = 'S'"
						}
					],
					"options": [
					  
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
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
				  );
				
			},
			limpiarFiltros: function(){
				this.byId("idPlantaIni").setValue("");
				this.byId("idPlantaFin").setValue("");
				this.byId("idArmadorIni").setValue("");
				this.byId("idArmadorFin").setValue("");
				this.byId("idEmbarcacionIni").setValue("");
				this.byId("idEmbarcacionFin").setValue("");
				this.byId("idFechaIniVigencia").setValue("");
				

			},
			loadComboPrecio: function(){
				oGlobalBusyDialog.open();
				var ZDO_PRECIO=null;
				var ZDO_ZESPRC=null;
				const bodyDominio = {
						"dominios": [
							{
							"domname": "ZESCSG",
							"status": "A"
							},
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
							
							ZDO_PRECIO= data.data.find(d => d.dominio == "ZESPRC").data;
							ZDO_ZESPRC=data.data.find(d => d.dominio == "ZESCSG").data;
							
							this.getModel("precio").setProperty("/ZDO_PRECIO", ZDO_PRECIO);
							this.getModel("castigo").setProperty("/ZESPRC", ZDO_ZESPRC);
							oGlobalBusyDialog.close();
						}).catch(error => console.log(error)
						);
			},
			 goBackMain: function () {
					this.getRouter().navTo("RouteApp");
					location.reload();
			},
			
			loadTablaPreciosAcopio: function(){
				oGlobalBusyDialog.open();
				let options=[];
				var idPlantaIni=this.byId("idPlantaIni").getValue();
				var idPlantaFin = this.byId("idPlantaFin").getValue();
				var idArmadorIni = this.byId("idArmadorIni").getValue();
				var idArmadorFin = this.byId("idArmadorFin").getValue();
				var idEmbarcacionIni = this.byId("idEmbarcacionIni").getValue();
				var idEmbarcacionFin = this.byId("idEmbarcacionFin").getValue();
				var idEstado = this.byId("idEstado").getSelectedKey();
				var idEstadoCastigo= this.byId("idEstadoCastigo").getSelectedKey();
				if(idPlantaIni && !idPlantaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"WERKS",
						valueHigh: idPlantaIni,
						valueLow:idPlantaIni
					});
				}
				if(!idPlantaIni && idPlantaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"WERKS",
						valueHigh: idPlantaFin,
						valueLow:idPlantaFin
					});
				}
				if(idPlantaIni && idPlantaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"WERKS",
						valueHigh: idPlantaFin,
						valueLow:idPlantaIni
					});
				}
			if(idArmadorIni && !idArmadorFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDEMP",
						valueHigh: idArmadorIni,
						valueLow:idArmadorIni
					});
			}
			if(!idArmadorIni && idArmadorFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDEMP",
					valueHigh: idArmadorFin,
					valueLow:idArmadorFin
				});
			}
			if(idArmadorIni && idArmadorFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDEMP",
					valueHigh: idArmadorFin,
					valueLow:idArmadorIni
				});
			}
			if(idEmbarcacionIni && !idEmbarcacionFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"CDEMB",
						valueHigh: idEmbarcacionIni,
						valueLow:idEmbarcacionIni
					});
			}
			if(!idEmbarcacionFin && idEmbarcacionFin){
				options.push({
					cantidad: "10",
					control:"MULTIINPUT",
					key:"CDEMB",
					valueHigh: idEmbarcacionFin,
					valueLow:idEmbarcacionFin
				});
			}
			if(idEmbarcacionIni && idEmbarcacionFin){
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
			// var conPrecio="";
			// 	console.log(idEstado);
			// 	if(idEstado=="L"){
			// 		conPrecio="(PRCOM IS NOT NULL AND PRCOM > 0)"
			// 	}else if(idEstado=="N"){
			// 		conPrecio="(PRCOM IS NULL OR PRCOM = 0)"
			// 	}
				let body = {
					
					"option": [
					   
					],
					"options": options,
					"p_user": "FGARCIA"
					}
					console.log(body);
					var indice=-1;
				   fetch(`${mainUrlServices}preciospesca/ConsultarProb`,
						{
							method: 'POST',
							body: JSON.stringify(body)
						})
						.then(resp => resp.json()).then(data => {
							 
							
								
									//let ViewModel= new JSONModel();
									var dataPrecio = data;
									console.log(dataPrecio);
									this.getView().getModel("Acopio").setProperty("/listaPrecio",dataPrecio.str_app);
									this.byId("title").setText("Lista de registros: "+dataPrecio.str_app.length);
									if(dataPrecio.str_app.length<=0){
										this.byId("title").setText("Lista de registros: No se encontraron resultados");
									}
									
									//console.log(this.getView().getModel());
									
								
						
							oGlobalBusyDialog.close();
	
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
			buscarEmbarca: function(evt){
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
				console.log(indices);
				var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
				if(this.popEmb==="popEmb"){
					this.byId("idEmbarcacionIni").setValue(data);
				}else if(this.popEmb==="popEmb2"){
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
						this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.consultapreciospesca.view.DlgEmbarcacion", this.getView().getController());
						this.getView().addDependent(this._oDialogEmbarcacion);
					}
					sap.ui.getCore().byId("idEmbarcacion").setValue("");
				sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
				sap.ui.getCore().byId("idMatricula").setValue("");
				sap.ui.getCore().byId("idRuc").setValue("");
				sap.ui.getCore().byId("idArmador").setValue("");
					return this._oDialogEmbarcacion;
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
					// if(idPropiedad){
					// 	options.push({
					// 		"cantidad": "20",
					// 		"control": "COMBOBOX",
					// 		"key": "INPRP",
					// 		"valueHigh": "",
					// 		"valueLow": idPropiedad
					// 	})
					// }
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
						this._oDialogArmador = sap.ui.xmlfragment("tasa.com.consultapreciospesca.view.DlgArmador", this.getView().getController());
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
					if(this.popUp==="popOne"){
						this.byId("idArmadorIni").setValue(data);
					}else if(this.popUp==="popTwo"){
						this.byId("idArmadorFin").setValue(data);
					}
					
					this._onCloseDialogArmador();	
				},
				onDataExport:  function() {
					var oExport = new Export({
						exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
						  separatorChar: ";",
						  charset: "utf-8"
						}),
						//PoliticaPrecio>/listaPolitica
						models: this.getView().getModel("Acopio"),
						rows:{path:""},
						rows: { path: "/listaPrecio" },
						columns: [
						  {
							name: "Centro",
							template: {
							  content: "{WERKS}"
							}
						  },
						  {
							name: "Matricula",
							template: {
							  content: "{MREMB}"
							}
						  },
						  {
							name: "Embarcacion",
							template: {
							  content: "{NMEMB}"
							}
						  },
						  {
							name: "Armador",
							template: {
							  content: "{NAME1}"
							}
						  },
						  
						  {
							name: "Fecha prod",
							template: {
							  content: "{FECCONMOV}"
							}
						  },
						  {
							name: "Cant. descargada",
							template: {
							  content: "{CNPDS}"
							}
						  },
						  {
							name: "Compra",
							template: {
							  content: "{PRCOM}"
							}
						  },
						  {
							name: "Bonif",
							template: {
							  content: "{BONIF}"
							}
						  },
						  {
							name: "Venta",
							template: {
							  content: "{PRVEN}"
							}
						  },
						  {
							name: "Moneda",
							template: {
							  content: "{DESC_WAERS}"
							}
						  },
						  {
							name: "Estado",
							template: {
							  content: "{DESC_ESPRC}"
							}
						  },
						  {
							name: "% Prop",
							template: {
							  content: "{PCSPP}"
							}
						  },
						  {
							name: "% Def",
							template: {
							  content: "{PCCSG}"
							}
						  },
						  {
							name: "Estado",
							template: {
							  content: "{DESC_ESCSG}"
							}
						  
						  },
						  {
							name: "Obs. super.",
							template: {
							  content: "{OBCDF}"
							}
						  
						  },
						  {
							name: "Obs. ger.",
							template: {
							  content: "{OBCPP}"
							}
						  
						  },
						  {
							name: "Calidad",
							template: {
							  content: "{CALIDAD}"
							}
						  },
						  {
							name: "% Juveniles",
							template: {
							  content: "{JUVEN}"
							}
						  },
						  {
							name: "TVN",
							template: {
							  content: "{TVN}"
							}
						  },
						  {
							name: "TDC",
							template: {
							  content: "{TDC}"
							}
						  },
						  {
							name: "Obs. calidad",
							template: {
							  content: "{OBCPP}"
							}
						  },
						  {
							name: "Orden compra",
							template: {
							  content: "{EBELN}"
							}
						  },
						  {
							name: "Factura",
							template: {
							  content: "{BELNR}"
							}
						  },
						  {
							name: "Doc. Fi",
							template: {
							  content: "{DOCFI}"
							}
						  },
						  {
							name: "Doc. Anulación",
							template: {
							  content: "{DOCFI2}"
							}
						  }
						]
					  });
					  oExport.saveFile("Precios de Acopio").catch(function(oError) {
						MessageBox.error("Error when downloading data. ..." + oError);
					  }).then(function() {
						oExport.destroy();
					  });
					},
					filterGlobally : function(oEvent) {
					  var sQuery = oEvent.getParameter("query");
					  this._oGlobalFilter = null;
			
							if (sQuery) {
								this._oGlobalFilter = new Filter([
									new Filter("DOCFI2", FilterOperator.Contains, sQuery),
									new Filter("DOCFI", FilterOperator.Contains, sQuery),
									new Filter("BELNR", FilterOperator.Contains, sQuery),
									new Filter("EBELN", FilterOperator.Contains, sQuery),
									new Filter("OBCPP", FilterOperator.Contains, sQuery),
									new Filter("OBCDF", FilterOperator.Contains, sQuery),
									new Filter("DESC_ESCSG", FilterOperator.Contains, sQuery),
									// new Filter("PCCSG", FilterOperator.Contains, sQuery),
									// new Filter("PCSPP", FilterOperator.Contains, sQuery),
									new Filter("DESC_ESPRC", FilterOperator.Contains, sQuery),
									new Filter("DESC_WAERS", FilterOperator.Contains, sQuery),
									new Filter("CALIDA", FilterOperator.Contains, sQuery),
									new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
									new Filter("NAME1", FilterOperator.Contains, sQuery),
									new Filter("NMEMB", FilterOperator.Contains, sQuery),
									new Filter("MREMB", FilterOperator.Contains, sQuery),
									new Filter("WERKS", FilterOperator.Contains, sQuery)									
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
				}
		});
	});

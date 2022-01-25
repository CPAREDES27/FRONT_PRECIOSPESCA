sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/util/Export",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, Controller, JSONModel, History, MessageToast, MessageBox, ExportTypeCSV, Export, Filter, FilterOperator, formatter, exportLibrary, Spreadsheet, BusyIndicator, Fragment) {
		"use strict";
		//const this.onLocation() = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
		var oGlobalBusyDialog = new sap.m.BusyDialog();
		var JsonFechaIni = {
			fechaIni: "",
			fechaIni2: ""
		};
		var popUp = "";
		var popEmb = "";
		var exportarExcel = false;
		var EdmType = exportLibrary.EdmType;
		var usuario = "";
		const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
		return BaseController.extend("tasa.com.preciosacopio.controller.App", {

			formatter: formatter,
			onInit: function () {
				let ViewModel = new JSONModel(
					{}
				);
				this.setModel(ViewModel, "consultaMareas");
				this.currentInputEmba = "";
				this.primerOption = [];
				this.segundoOption = [];
				this.currentPage = "";
				this.lastPage = "";
				this.router = this.getOwnerComponent().getRouter(this);
				this.router.getRoute("RouteApp").attachPatternMatched(this._onPatternMatched, this);
				oGlobalBusyDialog = new sap.m.BusyDialog();
				this.setModel(ViewModel, "litoral");
				this.setModel(ViewModel, "precio");
				this.setModel(ViewModel, "reporteCala")
				this.loadComboPrecio();
				this.listPlanta();
				this.loadIndicadorP();
				this.byId("idAciertos").setValue("200");


			},
			onAfterRendering: async function () {
				this._getCurrentUser();

				this.objetoHelp = this._getHelpSearch();
				this.parameter = this.objetoHelp[0].parameter;
				this.url = this.objetoHelp[0].url;
				this.callConstantes();

				// configuraciones para CheckBox
				let oAcopioModel = this.getModel("Acopio");
				oAcopioModel.setProperty("/enabledCheckboxAll",false);
			},

			callConstantes: function () {
				oGlobalBusyDialog.open();
				var body = {
					"nombreConsulta": "CONSGENCONST",
					"p_user": this.userOperation,
					"parametro1": this.parameter,
					"parametro2": "",
					"parametro3": "",
					"parametro4": "",
					"parametro5": ""
				}
				fetch(`${this.onLocation()}General/ConsultaGeneral/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {

						console.log(data.data);
						this.HOST_HELP = this.url + data.data[0].LOW;
						console.log(this.HOST_HELP);
						oGlobalBusyDialog.close();
					}).catch(error => console.log(error)
					);
			},
			_getCurrentUser: async function () {
				let oUshell = sap.ushell,
					oUser = {};
				if (oUshell) {
					let oUserInfo = await sap.ushell.Container.getServiceAsync("UserInfo");
					let sEmail = oUserInfo.getEmail().toUpperCase(),
						sName = sEmail.split("@")[0],
						sDominio = sEmail.split("@")[1];
					if (sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
					oUser = {
						name: sName
					}
				} else {
					oUser = {
						name: "FGARCIA"
					}
				}

				this.usuario = oUser.name;
				console.log(this.usuario);
			},
			loadIndicadorP: function () {
				oGlobalBusyDialog.open();
				var ZINPRP = null;
				var body = {
					"dominios": [
						{
							"domname": "ZINPRP",
							"status": "A"
						}
					]
				}
				fetch(`${this.onLocation()}dominios/Listar/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log(data);

						ZINPRP = data.data.find(d => d.dominio == "ZINPRP").data;

						this.getModel("Propiedad").setProperty("/listaPropiedad", ZINPRP);
						oGlobalBusyDialog.close();
					}).catch(error => console.log(error)
					);

			},
			listaEmbarcacion: function () {
				oGlobalBusyDialog.open();
				console.log("BusquedaEmbarca");
				var idEmbarcacion = sap.ui.getCore().byId("idEmbarcacion").getValue();
				var idEmbarcacionDesc = sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
				var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc = sap.ui.getCore().byId("idRuc").getValue();
				var idArmador = sap.ui.getCore().byId("idArmadorIni_R").getValue();
				var idPropiedad = sap.ui.getCore().byId("idPropiedad").getSelectedKey();

				var options = [];
				var options2 = [];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if (idEmbarcacion) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion

					});
				}
				if (idEmbarcacionDesc) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc

					});
				}
				if (idMatricula) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					})
				}
				if (idPropiedad) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					})
				}
				if (idRuc) {
					options2.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					})
				}
				if (idArmador) {
					options2.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador
					})
				}

				var body = {
					"option": [

					],
					"option2": [

					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB"
				}
				console.log(body);
				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log(data);
						var dataPuerto = data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion", dataPuerto));

						sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: " + dataPuerto.length);
						if (dataPuerto.length <= 0) {
							sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: No se encontraron resultados");
						}
						oGlobalBusyDialog.close();
					}).catch(error => console.log(error)
					);
			},
			listaArmador: function () {
				oGlobalBusyDialog.open();
				var idAciertos = sap.ui.getCore().byId("idAciertosPop").getValue();
				var idRuc = sap.ui.getCore().byId("idRuc2").getValue();
				var idDescripcion = sap.ui.getCore().byId("idDescripcion").getValue();
				var idCuentaProveedor = sap.ui.getCore().byId("idCuentaProveedor").getValue();

				console.log(idAciertos);
				console.log(idRuc);
				console.log(idDescripcion);
				console.log(idCuentaProveedor);
				var body = {
					"delimitador": "|",
					"fields": [

					],
					"no_data": "",
					"option": [

					],
					"options": [
						{
							"cantidad": "10",
							"control": "INPUT",
							"key": "LIFNR",
							"valueHigh": "",
							"valueLow": idCuentaProveedor,
						},
						{
							"cantidad": "10",
							"control": "INPUT",
							"key": "NAME1",
							"valueHigh": "",
							"valueLow": idDescripcion,
						},
						{
							"cantidad": "10",
							"control": "INPUT",
							"key": "STCD1",
							"valueHigh": "",
							"valueLow": idRuc,
						}

					],
					"order": "",
					"p_user": this.usuario,
					"rowcount": idAciertos,
					"rowskips": 0,
					"tabla": "LFA1"
				}
				fetch(`${this.onLocation()}General/Read_table/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						var dataPuerto = data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Armador").setProperty("/listaArmador", dataPuerto));
						sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: " + dataPuerto.length);
						if (dataPuerto.length <= 0) {
							sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: No se encontraron resultados");
						}
						oGlobalBusyDialog.close();
					}).catch(function (error) {
						if (error) {
							MessageBox.error(error.message);
							oGlobalBusyDialog.close();
						}
					});
			},
			limpiarFiltros: function () {
				this.byId("idPlantaIni").setValue("");
				//this.byId("idPlantaFin").setValue("");
				this.byId("idArmadorIni_R").setValue("");
				this.byId("idArmadorFin_R").setValue("");
				this.byId("inputId0_R").setValue("");
				this.byId("inputId1_R").setValue("");
				this.byId("fechaInicio").setValue("");
				this.byId("fechaFin").setValue("");


				this.getModel("Acopio").setProperty("/listaPrecio", []);				
				this.byId("title").setText("Lista de registros: 0");

				JsonFechaIni = {
					fechaFin: "",
					fechaFin2: ""
				}
			},
			getModel: function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Metodo reemplazado por checkBox
			 * @param {*} oEvent 
			 */
			onSelectionChange: function (oEvent) {
				let oTable = oEvent.getSource(),
					aSelectedIndices = oTable.getSelectedIndices(),
					iRowIndex = oEvent.getParameter("rowIndex"),
					oRowContex = oEvent.getParameter("rowContext").getObject(),
					sStatus = oRowContex.DESC_CALIDA,
					allSelected = oEvent.getParameter("selectAll");

				if (allSelected) {
					let listaPrecios = oEvent.getParameter("rowContext").getModel("/listaPrecio").getData().listaPrecio;
					let listaPreciosStatus = listaPrecios.filter(p => p.DESC_CALIDAD === "");
					if (listaPreciosStatus.length > 0) {
						MessageBox.error("Error en selección: No es posible editar porque no tienen registrados una calidad");
						oTable.clearSelection();
					}
				} else {
					if (sStatus === "" && aSelectedIndices.length > 0) {
						new sap.m.MessageToast.show("Error en selección: No es posible editar porque no tiene registrado una calidad", {
							duration: 3000,                  // default
							width: "20em",                   // default
							my: "center center",
							at: "center center"
						});
						let index = aSelectedIndices.indexOf(iRowIndex);
						if (index !== -1) {
							aSelectedIndices.splice(index, 1);
							if (aSelectedIndices.length === 0) {
								oTable.setSelectedIndex(-1);
							} else {
								aSelectedIndices.forEach(indice => {
									oTable.addSelectionInterval(indice, indice)
								})
							}
						}
					}
				}

			},

			/**
			 * Metodo que reemplaza a onSelectionChange
			 * @param {event} oEvent 
			 */
			onSelectCheckBox:function(oEvent){
				let bSelected = oEvent.getParameter("selected"),
				oAcopioModel = this.getModel("Acopio"),
				aRowData = oAcopioModel.getProperty("/listaPrecio"),
				bSelectedAll = oAcopioModel.getProperty("/selectedAllCheckBox");

				if(bSelectedAll){
					for (let i = 0; i < aRowData.length; i++) {
						if(aRowData[i].STATUS === undefined){
							if(!aRowData[i].selectedRow){
								// oAcopioModel.setProperty("/selectedAllCheckBox",true);
								oAcopioModel.setProperty("/partiallySelected",true);
								return;
							}else{
								oAcopioModel.setProperty("/partiallySelected",false);
								// oAcopioModel.setProperty("/selectedAllCheckBox",false);
							}
						}
					}
				}else{
					if(bSelected){
						oAcopioModel.setProperty("/selectedAllCheckBox",true);
						oAcopioModel.setProperty("/partiallySelected",true);
					}else{
						oAcopioModel.setProperty("/selectedAllCheckBox",false);
						// oAcopioModel.setProperty("/selectedAllCheckBox",false);
					}
				}


			},
			/**
			 * Event Handler para controlar todos los checkbox
			 * @param {event} oEvent 
			 */

			onSelectAllCheckBox:function(oEvent){
				let bSelected = oEvent.getParameter("selected"),
				oAcopioModel = this.getModel("Acopio"),
				aRowData = oAcopioModel.getProperty("/listaPrecio");
				
				aRowData.forEach(row => {
					if(row.STATUS === undefined){
						if(bSelected){
							row.selectedRow = true;
						}else{
							row.selectedRow = false;
						}
					}
				});
				oAcopioModel.setProperty("/listaPrecio",aRowData);

			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel: function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},
			listPlanta: function () {
				var dataPlantas = {
					"nombreAyuda": "BSQPLANTAS"
				};
				fetch(`${this.onLocation()}General/AyudasBusqueda`,
					{
						method: 'POST',
						body: JSON.stringify(dataPlantas)
					})
					.then(resp => resp.json()).then(data => {
						var dataPuerto = data.data;


						console.log(this.getView().getModel("Planta").setProperty("/listaPlanta", dataPuerto));
					}).catch(error => console.log(error)
					);

			},
			_onPatternMatched: function (oEvent) {
				console.log(this.getView().getModel("PrecioAcopio"));
			},
			goBackMain: function () {
				this.getRouter().navTo("RouteApp");
				location.reload();
			},
			loadComboPrecio: function () {
				var ZDO_PRECIO = null;
				const bodyDominio = {
					"dominios": [
						{
							"domname": "ZDO_PRECIO",
							"status": "A"
						}

					]
				}
				fetch(`${this.onLocation()}dominios/Listar`,
					{
						method: 'POST',
						body: JSON.stringify(bodyDominio)
					})
					.then(resp => resp.json()).then(data => {

						console.log(data);

						ZDO_PRECIO = data.data.find(d => d.dominio == "ZDO_PRECIO").data;

						this.getModel("precio").setProperty("/ZDO_PRECIO", ZDO_PRECIO);
						oGlobalBusyDialog.close();
					}).catch(error => console.log(error)
					);
			},
			buscarFecha: function (oEvent) {

				var dateIni = new Date(oEvent.mParameters.from);
				var dateIni2 = new Date(oEvent.mParameters.to);
				if (oEvent.mParameters.from == null) {
					dateIni = "";
				}
				if (oEvent.mParameters.to == null) {
					dateIni2 = "";
				}
				var id = oEvent.mParameters.id;
				var fechaIni = "";
				var fechaIni2 = "";
				if (dateIni) {
					fechaIni = this.generateFecha(dateIni);
				}
				if (dateIni2) {
					fechaIni2 = this.generateFecha(dateIni2);
				}

				if (id === "application-preciosacopio-display-component---App--idFechaIniVigencia") {
					JsonFechaIni = {
						fechaIni: fechaIni,
						fechaIni2: fechaIni2
					}
				}


			},
			generateFecha: function (date) {
				var day = date.getDate();
				var anio = date.getFullYear();
				var mes = date.getMonth() + 1;
				if (mes < 10) {
					mes = this.zeroFill(mes, 2);
				}
				if (day < 10) {
					day = this.zeroFill(day, 2);
				}
				var fecha = anio.toString() + mes.toString() + day.toString();


				return fecha;
			},
			castFechas: function (fecha) {
				var arrayFecha = fecha.split("/");
				console.log(arrayFecha);
				var fechas = arrayFecha[2] + "" + arrayFecha[1] + "" + arrayFecha[0];
				return fechas;
			},
			loadTablaPreciosAcopio: function () {
				// configuracion para checkbox
				let oAcopioModel = this.getModel("Acopio");
				oAcopioModel.setProperty("/selectedAllCheckBox", false);
				oAcopioModel.setProperty("/enabledCheckboxAll",true);

				oGlobalBusyDialog.open();
				let options = [];
				var idPlantaIni = this.byId("idPlantaIni").getValue();
				// var idPlantaFin = this.byId("idPlantaFin").getValue();
				var idArmadorIni = this.byId("idArmadorIni_R").getValue();
				var idArmadorFin = this.byId("idArmadorFin_R").getValue();
				var idEmbarcacionIni = this.byId("inputId0_R").getValue();
				var idEmbarcacionFin = this.byId("inputId1_R").getValue();
				var idEstado = this.byId("idEstado").getSelectedKey();
				var idAciertos = this.byId("idAciertos").getValue();
				//var fechaIni = this.byId("idFechaIniVigencia").getValue();
				
				var fechaInicio=this.byId("fechaInicio").getValue();
				var fechaFin=this.byId("fechaFin").getValue();

				if(fechaInicio){
					fechaInicio = fechaInicio.split("/")[2].concat(fechaInicio.split("/")[1], fechaInicio.split("/")[0]);
				}

				if(fechaFin){
					fechaFin = fechaFin.split("/")[2].concat(fechaFin.split("/")[1], fechaFin.split("/")[0]);

				}
				

				// if(!idPlantaIni && !idArmadorIni && !idArmadorFin && !idEmbarcacionIni && !idEmbarcacionFin
				// 	  && !fechaInicio && !fechaFin ){
				// 		var msj="Por favor ingrese un dato de selección";
				
				// 		MessageBox.error(msj);
				// 		oGlobalBusyDialog.close();
				// 		return false;
				// }

				if(fechaInicio && !fechaFin){
					fechaFin= fechaInicio;
				}
				if(fechaFin && !fechaInicio){
					fechaInicio= fechaFin;
				}

			
				
				if (idPlantaIni) {
					options.push({
						cantidad: "10",
						control: "MULTIINPUT",
						key: "WERKS",
						valueHigh: "",
						valueLow: idPlantaIni
					});
				}
				// if (idPlantaIni || idPlantaFin) {
				// 	options.push({
				// 		cantidad: "10",
				// 		control: "MULTIINPUT",
				// 		key: "WERKS",
				// 		valueHigh: idPlantaFin,
				// 		valueLow: idPlantaIni
				// 	});
				// }
				if (idArmadorIni || idArmadorFin) {
					options.push({
						cantidad: "10",
						control: "MULTIINPUT",
						key: "LIFNR",
						valueHigh: idArmadorFin,
						valueLow: idArmadorIni
					});
				}
				if (idEmbarcacionIni || idEmbarcacionFin) {
					options.push({
						cantidad: "10",
						control: "MULTIINPUT",
						key: "CDEMB",
						valueHigh: idEmbarcacionFin,
						valueLow: idEmbarcacionIni
					});
				}
				if (fechaInicio || fechaFin) {
					options.push({
						cantidad: "10",
						control: "MULTIINPUT",
						key: "FECCONMOV",
						valueHigh: fechaFin,
						valueLow: fechaInicio
					});
				}
				console.log(idEstado);
				if (idAciertos) {
					idAciertos = idAciertos;
				} else if (idAciertos == "") {
					idAciertos = 200;
				}


				let body = {
					"id_estado": idEstado,
					"num_application": 4,
					"p_calidad": "",
					"p_flag": "",
					"p_indpr": "C",
					"p_option": [],
					"p_options": options,
					"p_rows": idAciertos,
					"p_user": this.usuario
				}
				console.log(body);

				fetch(`${this.onLocation()}preciospesca/ConsultarPrecioMar`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log(data);
						// for(var valor in data.str_pm){

						// 	if(data.str_pm[valor].ESPRC==="L"){
						// 		data.str_pm[valor].ESPRC="Liberado";
						// 	}
						// 	if(data.str_pm[valor].ESPRC==="N"){
						// 		data.str_pm[valor].ESPRC="No Liberado";
						// 	}
						// 	if(data.str_pm[valor].NRMAR){
						// 	  data.str_pm[valor].NRMAR= this.zeroFill(data.str_pm[valor].NRMAR,10);
						// 	}

						// }
						console.log(data.str_pm);
						if (data.str_pm) {
							exportarExcel = true;
						}
						console.log(exportarExcel);
						for (var i = 0; i < data.str_pm.length; i++) {
							data.str_pm[i].PRCOM = parseFloat(data.str_pm[i].PRCOM).toFixed(2);
							data.str_pm[i].BONIF = parseFloat(data.str_pm[i].BONIF).toFixed(2);
							data.str_pm[i].PRCMX = parseFloat(data.str_pm[i].PRCMX).toFixed(2);
							data.str_pm[i].PRCTP = parseFloat(data.str_pm[i].PRCTP).toFixed(2);
							data.str_pm[i].NRMAR = this.zeroFill(data.str_pm[i].NRMAR, 10);
							data.str_pm[i].CNPDS = String(data.str_pm[i].CNPDS);
							if(data.str_pm[i].DESC_CALIDAD==''){
								data.str_pm[i].STATUS=false;
							}
						}
						var dataPrecio = data;
						this.getView().getModel("Acopio").setProperty("/listaPrecio", dataPrecio.str_pm);
						dataPrecio.str_pm.total = dataPrecio.str_pm.length;

						this.byId("title").setText("Lista de registros: " + dataPrecio.str_pm.total);
						

						// Habilitar o desabilitar selectores
						var tableMareas = this.getView().byId("table");
						tableMareas.getRows().forEach(row => {
							row.getCells().forEach(cell => {
								if (cell.getId() === "selector") {
									cell.setEnabled(true);
								}
							})
						})


						oGlobalBusyDialog.close();
					}).catch(error => console.log(error)
					);


			},
			bloquear: function () {
				var tbl = this.getView().byId("table");
				var header = tbl.$().find("thead");
				var selectAllCb = header.find(".sapMCb");
				selectAllCb.remove();

				var aItems = this.byId("table").getRows();
				//---> Check individual item property value and select the item
				aItems.forEach(function (oItem) {

					//---> If using OData Model items Binding, get the item object
					console.log(oItem);
					var mObject = oItem.oBindingContexts.Acopio;
					console.log(mObject);
					var sPath = oItem.oBindingContexts.Acopio.oModel.oData.listaPrecio;
					console.log(sPath);
					var completed = sPath[0].CALIDA;

					//--->get the id of Multi Checkbox
					var cb = oItem.$().find(".sapMCb");
					var oCb = this.byId(cb.prevObject("id"));

					if (completed === "") {
						oCb.setEditable(false);
						oItem.setSelected(true);
						oItem.getCells()[4].setEnabled(false);
					} else {
						oItem.setSelected(false);
					}
				});
			},

			zeroFill: function (number, width) {
				width -= number.toString().length;
				if (width > 0) {
					return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
				}
				return number + ""; // siempre devuelve tipo cadena
			},
			editSeleccionado: function () {
				this.getRouter().navTo("EditarAcopio");
			},
			editRow: function (oEvent) {
				var cadena = oEvent.getSource().getBindingContext("Acopio").getPath().split("/")[2];
				MessageBox.confirm(
					"¿Desea edigar el registro?", {
					icon: MessageBox.Icon.INFORMATION,
					title: "Editar Precio de Acopio",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction == "YES") {


							this.getRouter().navTo("EditarAcopio", { cadena });
						} else {

						}
					}.bind(this)
				}
				);



			},
			seleccion: function (oEvent) {
				console.log("hola");
			},
			editarMasivo: function (oEvent) {
				//var cb=this.byId("idCheckBox").getSelected();
				//var indices = this.byId("table").getSelectedIndices();
				
				let oAcopioModel = this.getModel("Acopio"),
				oRowData = oAcopioModel.getProperty("/listaPrecio");

				var cadena = "";
				for (var i = 0; i < oRowData.length; i++) {
					if(oRowData[i].selectedRow==true){
						cadena += i + ",";

					}
				}
				var cadena = cadena.substring(0, cadena.length - 1)
				console.log(cadena);
				this.getRouter().navTo("EditarAcopio", { cadena });
			},
			onDataExport: function () {
				var oExport = new Export({
					exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
						separatorChar: ";",
						charset: "utf-8"
					}),
					//PoliticaPrecio>/listaPolitica
					models: this.getView().getModel("Acopio"),
					rows: { path: "" },
					rows: { path: "/listaPrecio" },
					columns: [
						{
							name: "Marea",
							template: {
								content: "{NRMAR}"
							}
						},
						{
							name: "Nro descarga",
							template: {
								content: "{NRDES}"
							}
						},
						{
							name: "Planta",
							template: {
								content: "{DESCR}"
							}
						},
						{
							name: "Fecha inic. desc",
							template: {
								content: "{FIDES}"
							}
						},

						{
							name: "Hora inic. desc",
							template: {
								content: "{HIDES}"
							}
						},
						{
							name: "Fecha fin desc.",
							template: {
								content: "{FFDES}"
							}
						},
						{
							name: "Hora fin desc.",
							template: {
								content: "{HFDES}"
							}
						},
						{
							name: "Cantidad desc.(Tn)",
							template: {
								content: "{CNPDS}"
							}
						},
						{
							name: "Fecha prod.",
							template: {
								content: "{FECCONMOV}"
							}
						},
						{
							name: "Embarcación",
							template: {
								content: "{NMEMB}"
							}
						},
						{
							name: "Armador comercial",
							template: {
								content: "{NAME1}"
							}
						},
						{
							name: "Pactado",
							template: {
								content: "{PRCOM}"
							}
						},
						{
							name: "Bonificación",
							template: {
								content: "{BONIF}"
							}
						},
						{
							name: "Max",
							template: {
								content: "{PRCMX}"
							}

						},
						{
							name: "Tope",
							template: {
								content: "{PRCTP}"
							}

						},
						{
							name: "Moneda",
							template: {
								content: "{WAERS}"
							}

						},
						{
							name: "Estado",
							template: {
								content: "{ESPRC}"
							}
						},
						{
							name: "Especie",
							template: {
								content: "{DSSPC}"
							}
						},
						{
							name: "Calidad",
							template: {
								content: "{DESC_CALIDAD}"
							}
						},

					]
				});
				oExport.saveFile("Precios de Acopio").catch(function (oError) {
					MessageBox.error("Error when downloading data. ..." + oError);
				}).then(function () {
					oExport.destroy();
				});
			},
			onSearch: function (oEvent) {
				// add filter for search
				var aFilters = [];
				var sQuery = oEvent.getSource().getValue();
				if (sQuery && sQuery.length > 0) {
					var filter = new Filter([
						new Filter("NRMAR", FilterOperator.Contains, sQuery),
						new Filter("NMEMB", FilterOperator.Contains, sQuery),
						new Filter("CNPDS", FilterOperator.Contains, sQuery),
						new Filter("NRDES", FilterOperator.Contains, sQuery),
						new Filter("DESCR", FilterOperator.Contains, sQuery),
						new Filter("CDSPC", FilterOperator.Contains, sQuery),
						new Filter("FIDES", FilterOperator.Contains, sQuery),
						new Filter("HIDES", FilterOperator.Contains, sQuery),
						new Filter("FFDES", FilterOperator.Contains, sQuery),
						new Filter("HFDES", FilterOperator.Contains, sQuery),
						new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
						new Filter("NMEMB", FilterOperator.Contains, sQuery),
						new Filter("NAME1", FilterOperator.Contains, sQuery),
						new Filter("WAERS", FilterOperator.Contains, sQuery),
						new Filter("ESPRC", FilterOperator.Contains, sQuery),
						new Filter("DSSPC", FilterOperator.Contains, sQuery),
						new Filter("DESC_CALIDAD", FilterOperator.Contains, sQuery)
					]);
					aFilters.push(filter);
				}

				// update list binding
				var oList = this.byId("table");
				var oBinding = oList.getBinding("rows");
				oBinding.filter(aFilters, "Application");
			},
			filterGlobally: function (oEvent) {
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
						new Filter("NAME1", FilterOperator.Contains, sQuery),
						new Filter("WAERS", FilterOperator.Contains, sQuery),
						new Filter("ESPRC", FilterOperator.Contains, sQuery),
						new Filter("DSSPC", FilterOperator.Contains, sQuery),
						new Filter("CALIDA", FilterOperator.Contains, sQuery)

					], false);
				}

				this._filter();
			},
			_filter: function () {
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
			_onOpenDialogArmador: function (evn) {

				this.popUp = evn;
				this.getView().getModel("Armador").setProperty("/listaArmador", "");
				this._getDialogArmador().open();
			},

			_onCloseDialogArmador: function () {
				this._getDialogArmador().close();
				sap.ui.getCore().byId("idRuc2").setValue("");
				sap.ui.getCore().byId("idDescripcion").setValue("");
				sap.ui.getCore().byId("idCuentaProveedor").setValue("");
				sap.ui.getCore().byId("idListaArmador").setText("Lista de registros:");

			},

			_getDialogArmador: function () {
				if (!this._oDialogArmador) {
					this._oDialogArmador = sap.ui.xmlfragment("tasa.com.preciosacopio.view.DlgArmador", this.getView().getController());
					this.getView().addDependent(this._oDialogArmador);
					sap.ui.getCore().byId("idAciertosPop").setValue("200");
				}

				return this._oDialogArmador;
			},
			buscar: function (evt) {
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Armador.sPath.split("/")[2];
				console.log(indices);
				var data = this.getView().getModel("Armador").oData.listaArmador[indices].LIFNR;
				if (this.popUp === "popOne") {
					this.byId("idArmadorIni_R").setValue(data);
				} else if (this.popUp === "popTwo") {
					this.byId("idArmadorFin_R").setValue(data);
				}

				this._onCloseDialogArmador();
			},
			buscarEmbarca: function (evt) {
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
				console.log(indices);
				var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
				if (this.popEmb === "popEmb") {
					this.byId("idEmbarcacionIni").setValue(data);
				} else if (this.popEmb === "popEmb2") {
					this.byId("idEmbarcacionFin").setValue(data);
				}
				this._onCloseDialogEmbarcacion();

			},
			_onOpenDialogEmbarcacion: function (popup) {

				this.popEmb = popup;
				this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion", "");
				this._getDialogEmbarcacion().open();

			},

			_onCloseDialogEmbarcacion: function () {
				this._getDialogEmbarcacion().close();
			},

			_getDialogEmbarcacion: function () {
				if (!this._oDialogEmbarcacion) {
					this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.preciosacopio.view.DlgEmbarcacion", this.getView().getController());
					this.getView().addDependent(this._oDialogEmbarcacion);
				}
				sap.ui.getCore().byId("idEmbarcacion").setValue("");
				sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
				sap.ui.getCore().byId("idMatricula").setValue("");
				sap.ui.getCore().byId("idRuc").setValue("");
				sap.ui.getCore().byId("idArmadorIni_R").setValue("");
				return this._oDialogEmbarcacion;
			},
			listaEmbarcacion2: function () {
				oGlobalBusyDialog.open();
				var body = {
					"option": [

					],
					"option2": [
						{
							"wa": "ESEMB = 'O'"
						},
						{
							"wa": "AND INPRP LIKE 'P'"
						}
					],
					"options": [

					],
					"options2": [

					],
					"p_user": "BUSQEMB"
				}
				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						var dataPuerto = data.data;
						this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion", dataPuerto);
						oGlobalBusyDialog.close();


					}).catch(error => console.log(error)
					);
			},
			_onBuscarButtonPress: function () {
				var idEmbarcacion = sap.ui.getCore().byId("idEmbarcacion").getValue();
				var idEmbarcacionDesc = sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
				var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc = sap.ui.getCore().byId("idRuc").getValue();
				var idArmador = sap.ui.getCore().byId("idArmadorIni_R").getValue();
				console.log(this.getView().getModel("Embarcacion"));
				console.log(idEmbarcacion);
				var arrayEmbarcacion = this.getView().getModel("Embarcacion").oData.listaEmbarcacion;
				var arrayActual = [];
				var tamanio = arrayEmbarcacion.length;
				console.log(tamanio);
				if (!idEmbarcacion && !idEmbarcacionDesc && !idMatricula && !idRuc && !idArmador) {
					oGlobalBusyDialog.open();
					this.listaEmbarcacion2();
					oGlobalBusyDialog.close();
					this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion", this.getView().getModel("Embarcacion").oData.listaEmbarcacion);
				}
				for (var i = 0; i < tamanio; i++) {

					if (idEmbarcacion && arrayEmbarcacion[i].CDEMB === idEmbarcacion) {
						arrayActual.push({
							"CDEMB": arrayEmbarcacion[i].CDEMB,
							"MREMB": arrayEmbarcacion[i].MREMB,
							"NMEMB": arrayEmbarcacion[i].NMEMB,
							"LIFNR": arrayEmbarcacion[i].LIFNR,
							"NAME1": arrayEmbarcacion[i].NAME1
						})
						console.log(arrayActual);
						this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion", arrayActual);
					}
					if (idMatricula && arrayEmbarcacion[i].MREMB === idMatricula) {
						arrayActual.push({
							"CDEMB": arrayEmbarcacion[i].CDEMB,
							"MREMB": arrayEmbarcacion[i].MREMB,
							"NMEMB": arrayEmbarcacion[i].NMEMB,
							"LIFNR": arrayEmbarcacion[i].LIFNR,
							"NAME1": arrayEmbarcacion[i].NAME1
						})
						console.log(arrayActual);
						this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion", arrayActual);
					}
					if (idEmbarcacionDesc && arrayEmbarcacion[i].NMEMB === idEmbarcacionDesc) {
						arrayActual.push({
							"CDEMB": arrayEmbarcacion[i].CDEMB,
							"MREMB": arrayEmbarcacion[i].MREMB,
							"NMEMB": arrayEmbarcacion[i].NMEMB,
							"LIFNR": arrayEmbarcacion[i].LIFNR,
							"NAME1": arrayEmbarcacion[i].NAME1
						})
						console.log(arrayActual);
						this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion", arrayActual);
					}
					if (idRuc && arrayEmbarcacion[i].LIFNR === idRuc) {
						arrayActual.push({
							"CDEMB": arrayEmbarcacion[i].CDEMB,
							"MREMB": arrayEmbarcacion[i].MREMB,
							"NMEMB": arrayEmbarcacion[i].NMEMB,
							"LIFNR": arrayEmbarcacion[i].LIFNR,
							"NAME1": arrayEmbarcacion[i].NAME1
						})
						console.log(arrayActual);
						this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion", arrayActual);
					}
				}



			},
			onSelectEmba: function (evt) {
				var objeto = evt.getParameter("rowContext").getObject();
				if (objeto) {
					var cdemb = objeto.CDEMB;
					if (this.currentInputEmba.includes("inputId0_R")) {
						this.byId("inputId0_R").setValue(cdemb);
					} else if (this.currentInputEmba.includes("inputId1_R")) {
						this.byId("inputId1_R").setValue(cdemb);
					}
					this.getDialog().close();
				}
			},

			refreshFechaInicio: function () {
				this.getModel("consultaMareas").setProperty("/valueStateFechaInicioVigencia", "None");
			},

			onSearchEmbarcacion: function (evt) {
				BusyIndicator.show(0);
				var idEmbarcacion = sap.ui.getCore().byId("idEmba").getValue();
				var idEmbarcacionDesc = sap.ui.getCore().byId("idNombEmba").getValue();
				var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc = sap.ui.getCore().byId("idRucArmador").getValue();
				var idArmador = sap.ui.getCore().byId("idDescArmador").getValue();
				var idPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
				var options = [];
				var options2 = [];
				let embarcaciones = [];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if (idEmbarcacion) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion

					});
				}
				if (idEmbarcacionDesc) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc.toUpperCase()

					});
				}
				if (idMatricula) {
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					});
				}
				if (idPropiedad) {
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					});
				}
				if (idRuc) {
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					});
				}
				if (idArmador) {
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador.toUpperCase()
					});
				}

				this.primerOption = options;
				this.segundoOption = options2;

				var body = {
					"option": [

					],
					"option2": [

					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB",
					//"p_pag": "1" //por defecto la primera parte
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();

						if (!isNaN(data.p_totalpag)) {
							if (Number(data.p_totalpag) > 0) {
								sap.ui.getCore().byId("goFirstPag").setEnabled(true);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
								sap.ui.getCore().byId("goLastPag").setEnabled(true);
								sap.ui.getCore().byId("goNextPag").setEnabled(true);
								var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
								this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
								var numPag = Number(data.p_totalpag) + 1;
								var paginas = [];
								for (let index = 1; index < numPag; index++) {
									paginas.push({
										numero: index
									});
								}
								this.getModel("consultaMareas").setProperty("/NumerosPaginacion", paginas);
								sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							} else {
								var tituloTablaEmba = "Página 1/1";
								this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
								this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
								sap.ui.getCore().byId("goFirstPag").setEnabled(false);
								sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
								sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
								sap.ui.getCore().byId("goLastPag").setEnabled(false);
								sap.ui.getCore().byId("goNextPag").setEnabled(false);
								this.currentPage = "1";
								this.lastPage = data.p_totalpag;
							}
						}


						//sap.ui.getCore().byId("comboPaginacion").setVisible(true);

						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},


			onChangePag: function (evt) {
				var id = evt.getSource().getId();
				var oControl = sap.ui.getCore().byId(id);
				var pagina = oControl.getSelectedKey();
				this.currentPage = pagina;
				this.onNavPage();
			},

			onSetCurrentPage: function (evt) {
				var id = evt.getSource().getId();
				if (id == "goFirstPag") {
					this.currentPage = "1";
				} else if (id == "goPreviousPag") {
					if (!isNaN(this.currentPage)) {
						if (this.currentPage != "1") {
							var previousPage = Number(this.currentPage) - 1;
							this.currentPage = previousPage.toString();
						}
					}
				} else if (id == "goNextPag") {
					if (!isNaN(this.currentPage)) {
						if (this.currentPage != this.lastPage) {
							var nextPage = Number(this.currentPage) + 1;
							this.currentPage = nextPage.toString();
						}
					}
				} else if (id == "goLastPag") {
					this.currentPage = this.lastPage;
				}
				this.onNavPage();
			},

			onNavPage: function () {
				BusyIndicator.show(0);
				let embarcaciones = [];
				var body = {
					"option": [

					],
					"option2": [

					],
					"options": this.primerOption,
					"options2": this.segundoOption,
					"p_user": "BUSQEMB",
					"p_pag": this.currentPage
				};

				fetch(`${this.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					{
						method: 'POST',
						body: JSON.stringify(body)
					})
					.then(resp => resp.json()).then(data => {
						console.log("Emba: ", data);
						embarcaciones = data.data;

						this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
						this.getModel("consultaMareas").refresh();
						var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
						this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
						sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
						BusyIndicator.hide();
					}).catch(error => console.log(error));
			},
			getDialog: function () {
				if (!this.oDialog) {
					this.oDialog = sap.ui.xmlfragment("tasa.com.preciosacopio.view.Embarcacion", this);
					this.getView().addDependent(this.oDialog);
				}
				return this.oDialog;
			},
			onOpenEmba: function (evt) {
				this.currentInputEmba = evt.getSource().getId();
				this.getDialog().open();
			},


			buscarEmbarca: function (evt) {
				console.log(evt);
				var indices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
				console.log(indices);

				var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].CDEMB;
				if (this.currentInputEmba.includes("inputId0_R")) {
					this.byId("inputId0_R").setValue(data);
				} else if (this.currentInputEmba.includes("inputId1_R")) {
					this.byId("inputId1_R").setValue(data);
				}
				this.onCerrarEmba();

			},
			limpiarFiltro: function () {

				sap.ui.getCore().byId("idRuc2").setValue("");
				sap.ui.getCore().byId("idDescripcion").setValue("");
				sap.ui.getCore().byId("idCuentaProveedor").setValue("");
			},
			onCerrarEmba: function () {
				this.clearFilterEmba();
				this.getDialog().close();
				this.getModel("consultaMareas").setProperty("/embarcaciones", "");
				this.getModel("consultaMareas").setProperty("/TituloEmba", "");
				sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
				sap.ui.getCore().byId("goFirstPag").setEnabled(false);
				sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
				sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
				sap.ui.getCore().byId("goLastPag").setEnabled(false);
				sap.ui.getCore().byId("goNextPag").setEnabled(false);
				sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
			},
			clearFilterEmba: function () {
				sap.ui.getCore().byId("idEmba").setValue("");
				sap.ui.getCore().byId("idNombEmba").setValue("");
				sap.ui.getCore().byId("idRucArmador").setValue("");
				sap.ui.getCore().byId("idMatricula").setValue("");
				sap.ui.getCore().byId("indicadorPropiedad").setValue("");
				sap.ui.getCore().byId("idDescArmador").setValue("");
			},

			//Excel
			createColumnConfig5: function () {
				return [
					{
						label: 'Marea',
						property: 'NRMAR',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Nro descarga',
						property: 'NRDES',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Planta',
						property: 'DESCR',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Fecha inic. desc',
						property: 'FIDES',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Hora inic. desc',
						property: 'HIDES',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Fecha fin desc',
						property: 'FFDES',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Hora fin desc.',
						property: 'HFDES',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Cantidad desc.(Tn)',
						property: 'CNPDS',
						type: EdmType.Number,
						scale: 3,
						delimiter: true
					},
					{
						label: 'Fecha prod.',
						property: 'FECCONMOV',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Embarcación',
						property: 'NMEMB',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Armador comercial',
						property: 'NAME1',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Pactado',
						property: 'PRCOM',
						type: EdmType.Number,
						scale: 2,
						delimiter: true
					},
					{
						label: 'Bonificación',
						property: 'BONIF',
						type: EdmType.Number,
						scale: 2,
						delimiter: true
					},
					{
						label: 'Max',
						property: 'PRCMX',
						type: EdmType.Number,
						scale: 2,
						delimiter: true
					},
					{
						label: 'Tope',
						property: 'PRCTP',
						type: EdmType.Number,
						scale: 2,
						delimiter: true
					},
					{
						label: 'Moneda',
						property: 'WAERS',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Estado',
						property: 'ESPRC',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Especie',
						property: 'DSSPC',
						type: EdmType.String,
						scale: 2
					},
					{
						label: 'Calidad',
						property: 'DESC_CALIDA',
						type: EdmType.String,
						scale: 2
					}

				];
			},
			onExportarExcelData: function () {
				oGlobalBusyDialog.open();
				if (!exportarExcel) {
					MessageBox.error("Porfavor, realizar una búsqueda antes de exportar");
					oGlobalBusyDialog.close();
					return false;
				}
				var aCols, aProducts, oSettings, oSheet;

				aCols = this.createColumnConfig5();
				console.log(this.getView().getModel("Acopio"));
				aProducts = this.getView().getModel("Acopio").getProperty('/listaPrecio');

				oSettings = {

					workbook: {
						columns: aCols,
						context: {
							application: 'Debug Test Application',
							version: '1.95.0',
							title: 'Some random title',
							modifiedBy: 'John Doe',
							metaSheetName: 'Custom metadata'
						}

					},
					dataSource: aProducts,
					fileName: "Reporte Precios de Acopio"
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build()
					.then(function () {
						MessageToast.show('El Archivo ha sido exportado correctamente');
					})
					.finally(oSheet.destroy);
				oGlobalBusyDialog.close();
			},


			onSearchHelp: function (oEvent) {
				let sIdInput = oEvent.getSource().getId(),
					oModel = this.getModel(),
					nameComponent = "busqembarcaciones",
					idComponent = "busqembarcaciones",
					urlComponent = this.HOST_HELP + ".AyudasBusqueda.busqembarcaciones-1.0.0",
					oView = this.getView(),
					oInput = this.getView().byId(sIdInput);
				oModel.setProperty("/input", oInput);

				if (!this.DialogComponent) {
					this.DialogComponent = new sap.m.Dialog({
						title: "Búsqueda de embarcaciones",
						icon: "sap-icon://search",
						state: "Information",
						endButton: new sap.m.Button({
							icon: "sap-icon://decline",
							text: "Cerrar",
							type: "Reject",
							press: function (oEvent) {
								this.onCloseDialog(oEvent);
							}.bind(this)
						})
					});
					oView.addDependent(this.DialogComponent);
					oModel.setProperty("/idDialogComp", this.DialogComponent.getId());
				}

				let comCreateOk = function (oEvent) {
					BusyIndicator.hide();
				};


				if (this.DialogComponent.getContent().length === 0) {
					BusyIndicator.show(0);
					let oComponent = new sap.ui.core.ComponentContainer({
						id: idComponent,
						name: nameComponent,
						url: urlComponent,
						settings: {},
						componentData: {},
						propagateModel: true,
						componentCreated: comCreateOk,
						height: '100%',
						// manifest:true,
						async: false
					});

					this.DialogComponent.addContent(oComponent);
				}

				this.DialogComponent.open();
			},
			onCloseDialog: function (oEvent) {

				oEvent.getSource().getParent().close();
			},
			onShowSearchTrip: async function (oEvent) {
				let sIdInput = oEvent.getSource().getId(),
					oView = this.getView(),
					oModel = this.getModel(),
					sUrl = this.HOST_HELP + ".AyudasBusqueda.busqarmadores-1.0.0",
					nameComponent = "busqarmadores",
					idComponent = "busqarmadores",
					oInput = this.getView().byId(sIdInput);
				oModel.setProperty("/input", oInput);
				oModel.setProperty("/user",{
                    name:this.usuario
                });
				if (!this.DialogComponent) {
					this.DialogComponent = await Fragment.load({
						name: "tasa.com.preciosacopio.view.fragments.BusqArmadores",
						controller: this
					});
					oView.addDependent(this.DialogComponent);
				}
				oModel.setProperty("/idDialogComp", this.DialogComponent.getId());

				let compCreateOk = function () {
					BusyIndicator.hide()
				}
				if (this.DialogComponent.getContent().length === 0) {
					BusyIndicator.show(0);
					const oContainer = new sap.ui.core.ComponentContainer({
						id: idComponent,
						name: nameComponent,
						url: sUrl,
						settings: {},
						componentData: {},
						propagateModel: true,
						componentCreated: compCreateOk,
						height: '100%',
						// manifest: true,
						async: false
					});
					this.DialogComponent.addContent(oContainer);
				}

				this.DialogComponent.open();
			},
			onShowEmbarcaciones: async function (oEvent) {
				let sIdInput = oEvent.getSource().getId(),
					oView = this.getView(),
					oModel = this.getModel(),
					sUrl = this.HOST_HELP + ".AyudasBusqueda.busqembarcaciones-1.0.0",
					nameComponent = "busqembarcaciones",
					idComponent = "busqembarcaciones",
					oInput = this.getView().byId(sIdInput);
				oModel.setProperty("/input", oInput);

				if (!this.DialogComponents) {
					this.DialogComponents = await Fragment.load({
						name: "tasa.com.preciosacopio.view.fragments.BusqEmbarcaciones",
						controller: this
					});
					oView.addDependent(this.DialogComponents);
				}
				oModel.setProperty("/idDialogComp", this.DialogComponents.getId());

				let compCreateOk = function () {
					BusyIndicator.hide()
				}
				if (this.DialogComponents.getContent().length === 0) {
					BusyIndicator.show(0);
					const oContainer = new sap.ui.core.ComponentContainer({
						id: idComponent,
						name: nameComponent,
						url: sUrl,
						settings: {},
						componentData: {},
						propagateModel: true,
						componentCreated: compCreateOk,
						height: '100%',
						// manifest: true,
						async: false
					});
					this.DialogComponents.addContent(oContainer);
				}

				this.DialogComponents.open();
			},
		});
	});

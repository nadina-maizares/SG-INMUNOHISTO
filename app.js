/* ==========================================
   INTERACTIVE LOGIC FOR INMUNOHISTOQUIMICA
   SANATORIO GÜEMES - ANATOMÍA PATOLÓGICA
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // VIEW NAVIGATION
    const secSearch = document.getElementById('section-search');
    const secGrid = document.getElementById('section-grid');
    const secDetail = document.getElementById('section-detail');
    const mainTitle = document.getElementById('main-title');
    
    const currentProtocol = {
        protocolId: '230696',
        valeNumero: '63504027',
        originalInterno: '26-M-7520',
        annexInterno: '26-IP-7520',
        currentProtocolo: '26-M-7520',
        isAnnex: false,
        state: 'Finalizado',
        finalized: true
    };

    function renderProtocolHeaders() {
        const protoIntLabel = document.querySelector('.data-proto-int');
        const protocolIhqLabel = document.querySelector('.data-protocol-ihq');

        if (protoIntLabel) {
            protoIntLabel.textContent = currentProtocol.originalInterno;
        }

        if (protocolIhqLabel) {
            protocolIhqLabel.textContent = currentProtocol.isAnnex ? currentProtocol.annexInterno : 'Pendiente';
        }

        updateActionButtonsVisibility();
        updateEditorLock();
    }

    function updateActionButtonsVisibility() {
        const btnCreateAnnexInline = document.getElementById('btn-create-annex-inline');
        const displayVal = currentProtocol.finalized && !currentProtocol.isAnnex ? 'inline-flex' : 'none';
        if (btnCreateAnnexInline) btnCreateAnnexInline.style.display = displayVal;
    }

    function updateEditorLock() {
        const detailSection = document.getElementById('section-detail');
        const editors = detailSection.querySelectorAll('.wysiwyg-editor');
        const toolbarButtons = detailSection.querySelectorAll('.tool-btn-wysiwyg, .select-template, .wysiwyg-font-size, .wysiwyg-font-family');
        const lock = currentProtocol.finalized && !currentProtocol.isAnnex;

        editors.forEach(editor => {
            editor.setAttribute('contenteditable', lock ? 'false' : 'true');
            editor.classList.toggle('editor-locked', lock);
        });

        toolbarButtons.forEach(btn => {
            btn.disabled = lock;
        });
    }

    function setCurrentProtocolState(state) {
        currentProtocol.state = state;
        currentProtocol.finalized = state === 'Finalizado';
        updateActionButtonsVisibility();
        updateEditorLock();
    }

    function showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));

        const activeSec = document.getElementById(sectionId);
        if (!activeSec) {
            console.error(`Sección ${sectionId} no encontrada en el DOM`);
            return;
        }

        activeSec.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (sectionId === 'section-search') {
            mainTitle.innerHTML = 'Inmunohistoquímica <span class="subtitle-breadcrumb">/ Búsqueda</span>';
        } else if (sectionId === 'section-grid') {
            mainTitle.innerHTML = 'Inmunohistoquímica <span class="subtitle-breadcrumb">/ Resultados</span>';
        } else if (sectionId === 'section-detail') {
            mainTitle.innerHTML = 'Inmunohistoquímica <span class="subtitle-breadcrumb">/ Informe Detallado</span>';
            renderProtocolHeaders();
        } else if (sectionId === 'section-maestros-ihq') {
            mainTitle.innerHTML = 'Maestros <span class="subtitle-breadcrumb">/ Inmunohistoquímica</span>';
            renderMaestrosIHQList();
        } else if (sectionId === 'section-maestros-ihq-form') {
            mainTitle.innerHTML = 'Maestros <span class="subtitle-breadcrumb">/ Inmunohistoquímica / Editar Plantilla</span>';
        }
    }
    
    // Set initial title breadcrumb
    showSection('section-search');
    
    // COLLAPSIBLE SIDEBAR
    const sidebar = document.querySelector('.app-sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = sidebarToggleBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fa-solid fa-chevron-right';
            sidebarToggleBtn.title = "Expandir Menú";
        } else {
            icon.className = 'fa-solid fa-bars';
            sidebarToggleBtn.title = "Colapsar Menú";
        }
    });
    
    // COLLAPSIBLE SUBMENUS (Búsquedas y Maestros)
    document.querySelectorAll('.submenu-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            if (sidebar.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
                sidebarToggleBtn.querySelector('i').className = 'fa-solid fa-bars';
            }
            trigger.parentElement.classList.toggle('opened');
        });
    });
    
    // TOAST NOTIFICATIONS
    const toastContainer = document.getElementById('toast-container');
    
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        
        let iconHtml = '<i class="fa-solid fa-circle-info"></i>';
        if (type === 'success') {
            iconHtml = '<i class="fa-solid fa-circle-check"></i>';
        } else if (type === 'error') {
            iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
        }
        
        toast.innerHTML = `
            ${iconHtml}
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Remove toast from DOM after animations complete (3 seconds total)
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // SEARCH FORM ACTIONS
    const searchForm = document.getElementById('search-form');
    const inputId = document.getElementById('search-id');
    const inputVale = document.getElementById('search-vale');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const selectEstadoProtocolo = document.getElementById('select-estado-protocolo');
    
    if (!searchForm) {
        console.error('searchForm no encontrado');
        return;
    }
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = inputId.value.trim();
        const valeVal = inputVale.value.trim();
        
        if (!idVal && !valeVal) {
            showToast('Por favor, ingrese un ID o un número de Vale para realizar la búsqueda.', 'error');
            return;
        }
        
        try {
            // Show brief loading toast
            showToast('Buscando protocolo...', 'info');
            
            // Apply filtering row match immediately
            const filterTerm = valeVal || idVal;
            const gridBody = document.getElementById('grid-results-body');
            
            if (!gridBody) {
                console.error('gridBody no encontrado');
                showToast('Error: No se pudo localizar la tabla de resultados.', 'error');
                return;
            }
            
            const row = gridBody.querySelector('tr');
            
            if (!row) {
                console.error('row no encontrado');
                showToast('Error: No hay registros en la tabla.', 'error');
                return;
            }
            
            // Check if matches Jimenez record
            if (filterTerm.includes('63504027') || filterTerm.includes('230696') || 'jimenez'.includes(filterTerm.toLowerCase()) || filterTerm === '') {
                row.style.display = '';
                const recordsCount = document.querySelector('.records-count');
                if (recordsCount) {
                    recordsCount.innerHTML = '<i class="fa-solid fa-list-ol"></i> Total <strong>1 de 1</strong> registros';
                }
            } else {
                row.style.display = 'none';
                const recordsCount = document.querySelector('.records-count');
                if (recordsCount) {
                    recordsCount.innerHTML = '<i class="fa-solid fa-list-ol"></i> Total <strong>0 de 1</strong> registros';
                }
            }
            
            // Switch to grid section
            showSection('section-grid');
            showToast('Búsqueda completada. ' + (row.style.display === 'none' ? 'Sin resultados.' : 'Resultado encontrado.'), 'success');
            
        } catch (err) {
            console.error('Error en búsqueda:', err);
            showToast('Error al procesar la búsqueda. Revise la consola del navegador.', 'error');
        }
    });
    
    btnClearSearch.addEventListener('click', () => {
        inputId.value = '';
        inputVale.value = '';
        showToast('Campos de búsqueda limpiados.', 'info');
    });
    
    // GRID INTERACTIVE ACTIONS
    const btnViewProtocol = document.getElementById('btn-view-protocol');
    const rowJimenez = document.querySelector('.interactive-row');
    const btnExportExcel = document.getElementById('btn-export-excel');
    const gridFilter = document.getElementById('grid-filter');
    
    // Double click or eye icon to view details
    btnViewProtocol.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent double triggering from row click
        showToast('Cargando informe de Inmunohistoquímica...', 'info');
        setTimeout(() => {
            showSection('section-detail');
        }, 300);
    });
    
    rowJimenez.addEventListener('click', () => {
        showToast('Cargando informe de Inmunohistoquímica...', 'info');
        setTimeout(() => {
            showSection('section-detail');
        }, 300);
    });
    
    btnExportExcel.addEventListener('click', () => {
        showToast('Exportando listado de resultados a Microsoft Excel...', 'success');
    });
    
    // Grid live search filtering
    gridFilter.addEventListener('input', () => {
        const query = gridFilter.value.toLowerCase().trim();
        const row = document.querySelector('.interactive-row');
        const cells = Array.from(row.getElementsByTagName('td')).map(c => c.textContent.toLowerCase());
        
        let match = false;
        for (let cellContent of cells) {
            if (cellContent.includes(query)) {
                match = true;
                break;
            }
        }
        
        if (match) {
            row.style.display = '';
            document.querySelector('.records-count').innerHTML = '<i class="fa-solid fa-list-ol"></i> Total <strong>1 de 1</strong> registros';
        } else {
            row.style.display = 'none';
            document.querySelector('.records-count').innerHTML = '<i class="fa-solid fa-list-ol"></i> Total <strong>0 de 1</strong> registros';
        }
    });
    
    // DETAILED CLINICAL REPORT ACTIONS
    
    // Collapsible "Datos de Recepción"
    const cardRecepcion = document.getElementById('card-datos-recepcion');
    const btnToggleRecepcion = document.getElementById('btn-toggle-recepcion');
    
    btnToggleRecepcion.addEventListener('click', () => {
        cardRecepcion.classList.toggle('collapsed');
        const arrow = btnToggleRecepcion.querySelector('.accordion-arrow');
        if (cardRecepcion.classList.contains('collapsed')) {
            arrow.className = 'fa-solid fa-chevron-down accordion-arrow';
        } else {
            arrow.className = 'fa-solid fa-chevron-up accordion-arrow';
        }
    });
    
    // Protocolos Quirurgicos Button
    document.getElementById('btn-protocolos-quirurgicos').addEventListener('click', () => {
        showToast('Abriendo ventana externa: Protocolos Quirúrgicos Quirófano...', 'info');
    });
    
    // TEMPLATE SELECTION SYSTEM
    function setupTemplateLoader(selectId, btnId, editorId, templates) {
        const select = document.getElementById(selectId);
        const btn = document.getElementById(btnId);
        const editor = document.getElementById(editorId);
        
        btn.addEventListener('click', () => {
            const selectedVal = select.value;
            if (!selectedVal) {
                showToast('Por favor, elija una plantilla de la lista.', 'error');
                return;
            }
            
            if (templates[selectedVal] !== undefined) {
                editor.innerHTML = templates[selectedVal];
                showToast('Plantilla cargada con éxito en el editor.', 'success');
            }
        });
    }
    
    // Templates Content definitions
    const templatesMacro = {
        'macro-biopsia': 'Resección quirúrgica irregular, seccionada de 3x2.5x0.7 cm. Superficie externa lisa, pardo-amarillenta. Al corte se reconocen áreas amarillentas sólidas de aspecto granular. Se efectúan cortes representativos para estudio histológico.',
        'macro-nefrectomia': 'Pieza de nefrectomía radical que mide 12x7x5 cm y pesa 210 g. Cápsula parcialmente adherente. Al corte, a nivel del polo superior, se identifica lesión nodular bien circunscripta de 4x3 cm, de coloración amarillenta y consistencia firme, con áreas de necrosis central. Corteza y médula remanentes conservadas. Grasa perirrenal sin lesiones macroscópicas evidentes.',
        'macro-empty': ''
    };

    const templatesIHQ = {
        'ihq-std': '<strong>INMUNOHISTOQUÍMICA (Protocolo Estándar):</strong><br>Se reciben secciones histológicas de riñón. Se realizan técnicas de inmunomarcación automatizada para:<br><ul><li>PAX8: Positivo citoplasmático intenso.</li><li>CK7: Positivo membranoso focal.</li><li>CD117: Positivo citoplasmático difuso.</li></ul><br>Los controles internos y externos resultaron positivos y adecuados.',
        'ihq-panel': '<strong>IHQ PANEL ONCOLÓGICO RENAL:</strong><br>El análisis molecular e inmunohistoquímico demuestra:<br>- PAX8: Positivo fuerte (+)<br>- CK7: Positivo moderado (+)<br>- CD117 / c-KIT: Positivo difuso (+)<br>- Vimentina: Negativo (-)<br>- RCC antigen: Negativo (-)<br>Perfil inmunofenotípico consistente con la hipótesis diagnóstica primaria.',
        'ihq-empty': ''
    };

    const templatesMicro = {
        'micro-ihq': 'Se confirma parénquima renal que exhibe una proliferación de células epiteliales con citoplasma eosinófilo granular abundante y núcleos redondos regulares sin atipía marcada ni mitosis atípicas. Estroma con presencia de vasos capilares delgados y focos de cicatriz hialina central, coherente con marcaciones.',
        'micro-normal': 'Los cortes histológicos muestran parénquima renal maduro con glomérulos de tamaño y celularidad conservados. Membrana basal glomerular delgada. Túbulos contorneados proximales y distales con epitelio conservado. No se observan atipías celulares ni infiltrados inflamatorios significativos.',
        'micro-empty': ''
    };

    const templatesDiag = {
        'diag-oncocitoma': '<strong>DIAGNÓSTICO:</strong><br>Los hallazgos histopatológicos y el perfil de inmunohistoquímica (PAX8+, CK7+ focal, CD117+) son compatibles con:<br><h2>ONCOCITOMA RENAL</h2><br>Margen de resección quirúrgica libre de lesión neoplásica.',
        'diag-carcinoma': '<strong>DIAGNÓSTICO:</strong><br>Los hallazgos histopatológicos y el perfil inmunohistoquímico son altamente sugestivos de:<br><h2>CARCINOMA RENAL DE CÉLULAS CROMÓFOBAS</h2><br><em>(Variante eosinofílica)</em><br>Se sugiere correlación con estudios de extensión clínica.',
        'diag-empty': ''
    };

    setupTemplateLoader('template-macro', 'btn-select-macro', 'editor-macro', templatesMacro);
    setupTemplateLoader('template-ihq',   'btn-select-ihq',   'editor-ihq',   templatesIHQ);
    setupTemplateLoader('template-micro', 'btn-select-micro', 'editor-micro', templatesMicro);
    setupTemplateLoader('template-diag',  'btn-select-diag',  'editor-diag',  templatesDiag);
    
    // RICH TEXT EDITOR WYSIWYG COMMANDS
    const toolButtons = document.querySelectorAll('.tool-btn-wysiwyg');
    
    toolButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const toolbar = btn.parentElement;
            const editorId = toolbar.getAttribute('data-editor');
            const editor = document.getElementById(editorId);
            
            // Focus on target editor
            editor.focus();
            
            if (btn.classList.contains('bold')) {
                document.execCommand('bold', false, null);
                btn.classList.toggle('active');
            } else if (btn.classList.contains('italic')) {
                document.execCommand('italic', false, null);
                btn.classList.toggle('active');
            } else if (btn.classList.contains('underline')) {
                document.execCommand('underline', false, null);
                btn.classList.toggle('active');
            } else if (btn.classList.contains('align-left')) {
                document.execCommand('justifyLeft', false, null);
                clearAligns(toolbar);
                btn.classList.add('active');
            } else if (btn.classList.contains('align-center')) {
                document.execCommand('justifyCenter', false, null);
                clearAligns(toolbar);
                btn.classList.add('active');
            } else if (btn.classList.contains('align-right')) {
                document.execCommand('justifyRight', false, null);
                clearAligns(toolbar);
                btn.classList.add('active');
            } else if (btn.classList.contains('align-justify')) {
                document.execCommand('justifyFull', false, null);
                clearAligns(toolbar);
                btn.classList.add('active');
            } else if (btn.classList.contains('print')) {
                printDiv(editor.innerHTML);
            } else if (btn.classList.contains('insert-tag')) {
                document.execCommand('insertHTML', false, ' <span class="editor-tag">[Pendiente Revisión]</span> ');
                showToast('Etiqueta insertada.', 'info');
            } else if (btn.classList.contains('insert-image')) {
                const url = prompt('Ingrese la URL de la imagen médica a adjuntar:');
                if (url) {
                    document.execCommand('insertImage', false, url);
                    showToast('Imagen médica insertada.', 'success');
                }
            } else if (btn.classList.contains('toggle-spell')) {
                const isSpelled = editor.getAttribute('spellcheck') === 'true';
                editor.setAttribute('spellcheck', !isSpelled);
                btn.classList.toggle('active');
                showToast(`Revisión ortográfica ${!isSpelled ? 'activada' : 'desactivada'} en este editor.`, 'info');
            }
        });
    });
    
    function clearAligns(toolbar) {
        const alignBtns = toolbar.querySelectorAll('.align-left, .align-center, .align-right, .align-justify');
        alignBtns.forEach(btn => btn.classList.remove('active'));
    }
    
    // Font Name and Size change handling
    document.querySelectorAll('.wysiwyg-font-size').forEach(select => {
        select.addEventListener('change', () => {
            const editorId = select.parentElement.getAttribute('data-editor');
            document.getElementById(editorId).focus();
            document.execCommand('fontSize', false, select.value);
            showToast(`Tamaño de fuente cambiado a ${select.options[select.selectedIndex].text}`, 'info');
        });
    });
    
    document.querySelectorAll('.wysiwyg-font-family').forEach(select => {
        select.addEventListener('change', () => {
            const editorId = select.parentElement.getAttribute('data-editor');
            document.getElementById(editorId).focus();
            document.execCommand('fontName', false, select.value);
            showToast(`Tipografía cambiada a ${select.value}`, 'info');
        });
    });
    
    // Print a specific editor section
    function printDiv(htmlContent) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Sanatorio Güemes - Anatomía Patológica (Imprimir Sección)</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                    .header { border-bottom: 2px solid #00adb5; padding-bottom: 10px; margin-bottom: 20px; }
                    .header h1 { font-size: 18px; margin: 0; color: #333; }
                    .content { font-size: 13px; color: #111; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SANATORIO GÜEMES - ANATOMÍA PATOLÓGICA</h1>
                    <small>Impresión de sección de Protocolo de Inmunohistoquímica</small>
                </div>
                <div class="content">
                    ${htmlContent}
                </div>
                <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
    
    // NAVIGATION BACK BUTTONS
    document.getElementById('btn-back-to-grid').addEventListener('click', () => {
        showSection('section-grid');
    });
    
    document.getElementById('btn-back-to-search').addEventListener('click', () => {
        showSection('section-search');
    });
    
    // FULL PRINT PROTOCOL BUTTON
    document.getElementById('btn-print-full').addEventListener('click', () => {
        showToast('Generando vista de impresión del protocolo...', 'info');

        const macroText = document.getElementById('editor-macro').innerHTML;
        const microText = document.getElementById('editor-micro').innerHTML;
        const ihqText   = document.getElementById('editor-ihq').innerHTML;
        const diagText  = document.getElementById('editor-diag').innerHTML;
        const estadoText = document.getElementById('select-estado-protocolo').value;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Protocolo - Sanatorio Güemes</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #222; }
                    .print-container { max-width: 800px; margin: 0 auto; }
                    .print-header { border-bottom: 2px solid #00adb5; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
                    .print-logo h1 { font-size: 20px; font-weight: bold; margin: 0; color: #00adb5; }
                    .print-logo span { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                    .print-meta { font-size: 12px; color: #444; text-align: right; line-height: 1.8; }
                    .patient-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 15px; border-radius: 6px; margin-bottom: 24px; font-size: 13px; }
                    .patient-box strong { color: #c00; }
                    .report-section { margin-bottom: 22px; page-break-inside: avoid; }
                    .section-title { font-size: 12px; font-weight: bold; color: #00adb5; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
                    .section-content { font-size: 13px; line-height: 1.65; }
                    .footer-signature { margin-top: 60px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; font-size: 12px; text-align: center; }
                    .sig-line { border-top: 1px solid #aaa; padding-top: 5px; margin-top: 50px; }
                    .estado-bar { font-size: 11px; color: #666; margin-top: 18px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="print-header">
                        <div class="print-logo">
                            <h1>SANATORIO GÜEMES</h1>
                            <span>Anatomía Patológica</span>
                        </div>
                        <div class="print-meta">
                            Protocolo Int: <strong>${currentProtocol.currentProtocolo}</strong><br>
                            Nro. de Vale: 63504027<br>
                            Fecha de Recepción: 2026-06-11 11:06<br>
                            Material: BIOPSIA (RIÑON)
                        </div>
                    </div>

                    <div class="patient-box">
                        <strong>JIMENEZ DEL TORO JOSE ANTONIO</strong> &nbsp;|&nbsp; H.C.: 3628850-4 &nbsp;|&nbsp; Edad: 70 años
                    </div>

                    <div class="report-section">
                        <div class="section-title">Macroscopía</div>
                        <div class="section-content">${macroText}</div>
                    </div>

                    <div class="report-section">
                        <div class="section-title">Microscopía</div>
                        <div class="section-content">${microText}</div>
                    </div>

                    <div class="report-section">
                        <div class="section-title">Inmunohistoquímica</div>
                        <div class="section-content">${ihqText || '<i>Sin datos de inmunohistoquímica registrados</i>'}</div>
                    </div>

                    <div class="report-section">
                        <div class="section-title">Diagnóstico</div>
                        <div class="section-content">${diagText || '<i>Sin diagnóstico definitivo registrado</i>'}</div>
                    </div>

                    <div class="estado-bar">
                        Estado del Informe: <strong>${estadoText.toUpperCase()}</strong>
                    </div>

                    <div class="footer-signature">
                        <div>
                            <div class="sig-line">
                                <strong>Dra. Adriana Montaño Cabrera</strong><br>
                                Responsable de Inmunohistoquímica
                            </div>
                        </div>
                        <div>
                            <div class="sig-line">
                                <strong>Dra. Estefanía S. Dos Santos</strong><br>
                                Patóloga de Guardia
                            </div>
                        </div>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); window.close(); }<\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });
    
    // CONFIRMATION MODAL & SAVE ACTIONS
    const btnSaveChanges = document.getElementById('btn-save-changes');
    const saveModal = document.getElementById('save-modal');
    const btnModalClose = document.getElementById('btn-modal-close');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');
    const modalSummaryEstado = document.getElementById('modal-summary-estado');
    
    btnSaveChanges.addEventListener('click', () => {
        if (currentProtocol.finalized && !currentProtocol.isAnnex) {
            showToast('El protocolo ya está finalizado. Cree un anexo / nuevo control para continuar sin modificar el informe original.', 'error');
            return;
        }

        // Update modal summary with selected state
        modalSummaryEstado.textContent = selectEstadoProtocolo.options[selectEstadoProtocolo.selectedIndex].text;
        
        // Open Modal
        saveModal.classList.add('active');
    });
    
    // Inline annex button located beneath "Protocolo IHQ / Anexo"
    const btnCreateAnnexInline = document.getElementById('btn-create-annex-inline');
    if (btnCreateAnnexInline) {
        btnCreateAnnexInline.addEventListener('click', () => {
            const confirmed = confirm('¿Está seguro que desea crear el anexo IP para este protocolo?');
            if (!confirmed) return;

            currentProtocol.isAnnex = true;
            currentProtocol.currentProtocolo = currentProtocol.annexInterno;
            currentProtocol.state = 'Inmunohistoquimica';
            currentProtocol.finalized = false;
            const sel = document.getElementById('select-estado-protocolo');
            if (sel) sel.value = 'Inmunohistoquimica';
            renderProtocolHeaders();
            showToast('Anexo creado desde botón inline.', 'success');
        });
    }

    selectEstadoProtocolo.addEventListener('change', (e) => {
        setCurrentProtocolState(e.target.value);
    });

    function closeModal() {
        saveModal.classList.remove('active');
    }
    
    btnModalClose.addEventListener('click', closeModal);
    btnModalCancel.addEventListener('click', closeModal);
    
    btnModalConfirm.addEventListener('click', () => {
        closeModal();
        showToast('Guardando cambios del informe...', 'info');
        
        setTimeout(() => {
            // Update timestamps on page
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const newDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            // Set all dates on details view
            const dateLabels = document.querySelectorAll('.meta-date-value');
            dateLabels.forEach(lbl => {
                lbl.textContent = newDateString;
            });
            
            // Update current protocol state from selected status
            currentProtocol.finalized = selectEstadoProtocolo.value === 'Finalizado';
            currentProtocol.state = selectEstadoProtocolo.value;
            renderProtocolHeaders();
            
            // Update grid values
            const gridRow = document.querySelector('.interactive-row');
            const statusCell = gridRow.querySelector('.badge-status-micro');
            if (statusCell) {
                statusCell.textContent = selectEstadoProtocolo.options[selectEstadoProtocolo.selectedIndex].text;
            }
            
            // Redirect back to grid
            showSection('section-grid');
            showToast('Protocolo de Inmunohistoquímica guardado exitosamente.', 'success');
        }, 800);
    });
    
    // LIGHT/DARK THEME TOGGLE
    const themeToggleBtn = document.getElementById('theme-mode-toggle');
    const body = document.body;
    
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('theme-dark');
        const icon = themeToggleBtn.querySelector('i');
        
        if (body.classList.contains('theme-dark')) {
            icon.className = 'fa-solid fa-sun';
            themeToggleBtn.title = "Activar Modo Claro";
            showToast('Modo Oscuro activado.', 'info');
        } else {
            icon.className = 'fa-solid fa-moon';
            themeToggleBtn.title = "Activar Modo Oscuro";
            showToast('Modo Claro activado.', 'info');
        }
    });
    
    // =============================================
    // MAESTROS IHQ - DATOS Y LÓGICA
    // =============================================

    let maestrosIHQData = [
        { id: 1,  titulo: 'ADENOCA ACINAR PROSTATA',           contenido: 'Las secciones histológicas muestran fragmentos de tejido prostático que exhibe focos de una proliferación neoplásica infiltrante con moderado pleomorfismo nuclear, nucléolos evidentes, que se disponen en estructuras glandulares rígidas, algunas anastomosadas entre sí, y otras de manera difusa.' },
        { id: 2,  titulo: 'ADENOCARCINOMA COLON',              contenido: 'Se observan secciones de colon con proliferación glandular neoplásica de patrón tubular irregular, con células de núcleo hipercromático y pleomórfico, disposición pseudoestratificada, y variable producción de mucina.' },
        { id: 3,  titulo: 'ADENOMA CORTICAL ADRENAL',          contenido: 'Proliferación celular bien delimitada de células corticales adrenales con citoplasma claro/eosinófilo, núcleos regulares sin atipías significativas ni actividad mitótica relevante. Compatible con adenoma adrenocortical.' },
        { id: 4,  titulo: 'ADENOMA FOLICULAR DE TIROIDES',     contenido: 'Nódulo tiroideo encapsulado constituido por folículos de tamaño variable tapizados por células con escaso pleomorfismo nuclear. Sin invasión capsular ni vascular identificada.' },
        { id: 5,  titulo: 'CARCINOMA DE CÉLULAS CLARAS RENAL', contenido: 'Proliferación neoplásica de células poligonales con citoplasma claro abundante y núcleos ISUP grado 2, dispuestas en nidos sólidos con red vascular fina. IHQ: PAX8+, CD10+, RCC+, CK7-, TFE3-.' },
        { id: 6,  titulo: 'CARCINOMA LOBULILLAR MAMA',         contenido: 'Infiltración difusa del parénquima mamario por células tumorales pequeñas a medianas, dispuestas en fila india con escasa cohesión. IHQ: RE+, RP+, HER2-, E-cadherina negativo.' },
        { id: 7,  titulo: 'LINFOMA DIFUSO CÉLULAS B GRANDES',  contenido: 'Proliferación linfoide difusa de células grandes con núcleos vesiculosos, nucléolos prominentes y frecuentes mitosis. IHQ: CD20+, CD3-, PAX5+, BCL2+, BCL6+, Ki67 &gt; 70%.' },
        { id: 8,  titulo: 'MELANOMA MALIGNO',                  contenido: 'Nidos y células tumorales epitelioides con marcado pleomorfismo, nucléolos prominentes y pigmento melánico intracitoplásmico. IHQ: HMB45+, Melan-A+, S100+, SOX10+.' },
        { id: 9,  titulo: 'ONCOCITOMA RENAL',                  contenido: 'Proliferación de células eosinófilas granulares con núcleos regulares sin atipías significativas, dispuestas en nidos sólidos y arquitectura tubuloquística. IHQ: PAX8+, CK7 focal, CD117+, vimentina-.' },
    ];
    let maestrosNextId = 10;
    let maestrosEditingId = null;

    function renderMaestrosIHQList(filterText) {
        const tbody = document.getElementById('maestros-ihq-body');
        const countEl = document.getElementById('maestros-count-text');
        const query = (filterText || document.getElementById('maestros-filter').value || '').toLowerCase().trim();

        const filtered = maestrosIHQData.filter(item =>
            !query || item.titulo.toLowerCase().includes(query)
        );

        tbody.innerHTML = '';
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'interactive-row';
            tr.innerHTML = `
                <td class="cell-bold">${item.id}</td>
                <td>${item.titulo}</td>
                <td class="col-center">
                    <button class="btn-action-note btn-edit-maestro" data-id="${item.id}" title="Modificar plantilla">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        countEl.textContent = `${filtered.length} de ${maestrosIHQData.length}`;

        tbody.querySelectorAll('.btn-edit-maestro').forEach(btn => {
            btn.addEventListener('click', () => {
                openMaestrosForm(parseInt(btn.getAttribute('data-id')));
            });
        });
    }

    function openMaestrosForm(id) {
        maestrosEditingId = id || null;
        const tituloInput = document.getElementById('maestros-titulo');
        const editor = document.getElementById('editor-maestros');

        if (id) {
            const item = maestrosIHQData.find(m => m.id === id);
            if (item) {
                tituloInput.value = item.titulo;
                editor.innerHTML = item.contenido;
            }
        } else {
            tituloInput.value = '';
            editor.innerHTML = '';
        }

        showSection('section-maestros-ihq-form');
    }

    document.getElementById('maestros-filter').addEventListener('input', (e) => {
        renderMaestrosIHQList(e.target.value);
    });

    document.getElementById('btn-maestros-nuevo').addEventListener('click', () => {
        openMaestrosForm(null);
    });

    document.getElementById('btn-maestros-guardar').addEventListener('click', () => {
        const titulo = document.getElementById('maestros-titulo').value.trim();
        const contenido = document.getElementById('editor-maestros').innerHTML.trim();

        if (!titulo) {
            showToast('Por favor, ingrese un título para la plantilla.', 'error');
            return;
        }

        if (maestrosEditingId) {
            const idx = maestrosIHQData.findIndex(m => m.id === maestrosEditingId);
            if (idx >= 0) {
                maestrosIHQData[idx].titulo = titulo.toUpperCase();
                maestrosIHQData[idx].contenido = contenido;
            }
            showToast('Plantilla actualizada exitosamente.', 'success');
        } else {
            maestrosIHQData.push({ id: maestrosNextId++, titulo: titulo.toUpperCase(), contenido });
            showToast('Plantilla creada exitosamente.', 'success');
        }

        showSection('section-maestros-ihq');
    });

    document.getElementById('btn-maestros-cancelar').addEventListener('click', () => {
        showSection('section-maestros-ihq');
    });

    // SIDEBAR INTERACTIVE CLICKS
    document.getElementById('nav-inicio').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Volviendo a la pantalla principal...', 'info');
        showSection('section-search');
    });
    
    document.getElementById('nav-recepcion').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Redireccionando a Recepción de Material...', 'info');
    });

    document.getElementById('nav-biopsias').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Módulo Biopsias y Líquidos - Pendientes en desarrollo.', 'info');
    });

    document.getElementById('nav-pap').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Módulo Pap - Pendientes en desarrollo.', 'info');
    });
    
    document.getElementById('sub-pacientes').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Búsqueda por Pacientes no habilitada en este prototipo.', 'info');
    });
    
    document.getElementById('sub-vale').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Búsqueda por Vale general no habilitada. Use la solapa Inmunohistoquímica.', 'info');
    });
    
    document.getElementById('sub-estudios').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Módulo de Estudios en desarrollo.', 'info');
    });
    
    document.getElementById('sub-ihq').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('section-search');
    });
    
    document.getElementById('sub-adjuntos').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Módulo de Adjuntos no habilitado en este prototipo.', 'info');
    });

    document.getElementById('sub-maestros-ihq').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('section-maestros-ihq');
    });

    document.getElementById('nav-salir').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Desea cerrar la sesión actual en el sistema de Anatomía Patológica?')) {
            showToast('Sesión cerrada. Redireccionando...', 'info');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    });
    
});

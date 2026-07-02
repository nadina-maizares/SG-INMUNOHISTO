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
    
    function showSection(sectionId) {
        // Hide all
        [secSearch, secGrid, secDetail].forEach(sec => {
            sec.classList.remove('active');
        });
        
        // Show selected
        const activeSec = document.getElementById(sectionId);
        activeSec.classList.add('active');
        
        // Update Title and Layout adjustments
        if (sectionId === 'section-search') {
            mainTitle.innerHTML = 'Inmunohistoquímica <span class="subtitle-breadcrumb">/ Búsqueda</span>';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (sectionId === 'section-grid') {
            mainTitle.innerHTML = 'Inmunohistoquímica <span class="subtitle-breadcrumb">/ Resultados</span>';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (sectionId === 'section-detail') {
            mainTitle.innerHTML = 'Inmunohistoquímica <span class="subtitle-breadcrumb">/ Informe Detallado</span>';
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // COLLAPSIBLE SUBMENU
    const submenuTrigger = document.querySelector('.submenu-trigger');
    const navItemSubmenu = submenuTrigger.parentElement;
    
    submenuTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        // If sidebar is collapsed, expand it first
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            sidebarToggleBtn.querySelector('i').className = 'fa-solid fa-bars';
        }
        navItemSubmenu.classList.toggle('opened');
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
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = inputId.value.trim();
        const valeVal = inputVale.value.trim();
        
        if (!idVal && !valeVal) {
            showToast('Por favor, ingrese un ID o un número de Vale para realizar la búsqueda.', 'error');
            return;
        }
        
        // Simulating search process
        showToast('Buscando en la base de datos de Anatomía Patológica...', 'info');
        
        setTimeout(() => {
            // Apply filtering row match
            const filterTerm = valeVal || idVal;
            const gridBody = document.getElementById('grid-results-body');
            const row = gridBody.querySelector('tr');
            
            // Check if matches Jimenez record
            if (filterTerm.includes('63504027') || filterTerm.includes('230696') || 'jimenez'.includes(filterTerm.toLowerCase()) || filterTerm === '') {
                row.style.display = '';
                document.querySelector('.records-count').innerHTML = '<i class="fa-solid fa-list-ol"></i> Total <strong>1 de 1</strong> registros';
            } else {
                row.style.display = 'none';
                document.querySelector('.records-count').innerHTML = '<i class="fa-solid fa-list-ol"></i> Total <strong>0 de 1</strong> registros';
            }
            
            showSection('section-grid');
            showToast('Búsqueda finalizada. Resultados actualizados.', 'success');
        }, 600);
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
    
    setupTemplateLoader('template-ihq', 'btn-select-ihq', 'editor-ihq', templatesIHQ);
    setupTemplateLoader('template-micro', 'btn-select-micro', 'editor-micro', templatesMicro);
    setupTemplateLoader('template-diag', 'btn-select-diag', 'editor-diag', templatesDiag);
    
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
        showToast('Generando vista de impresión del protocolo de Inmunohistoquímica...', 'info');
        
        const ihqText = document.getElementById('editor-ihq').innerHTML;
        const microText = document.getElementById('editor-micro').innerHTML;
        const diagText = document.getElementById('editor-diag').innerHTML;
        const obsText = document.getElementById('editor-obs').innerHTML;
        const estadoText = document.getElementById('select-estado-protocolo').value;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Protocolo de Inmunohistoquímica - Sanatorio Güemes</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #222; }
                    .print-container { max-width: 800px; margin: 0 auto; }
                    .print-header { border-bottom: 2px solid #00adb5; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                    .print-logo h1 { font-size: 20px; font-weight: bold; margin: 0; color: #00adb5; }
                    .print-logo span { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                    .print-date { font-size: 12px; color: #666; }
                    .patient-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 30px; }
                    .patient-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; }
                    .patient-grid div span { font-weight: bold; }
                    .report-section { margin-bottom: 25px; }
                    .section-title { font-size: 13px; font-weight: bold; color: #00adb5; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; }
                    .section-content { font-size: 13px; line-height: 1.6; white-space: normal; }
                    .footer-signature { margin-top: 50px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; font-size: 12px; text-align: center; }
                    .sig-line { border-top: 1px solid #aaa; padding-top: 5px; margin-top: 50px; }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="print-header">
                        <div class="print-logo">
                            <h1>SANATORIO GÜEMES</h1>
                            <span>Anatomía Patológica</span>
                        </div>
                        <div class="print-date">Protocolo Int: <strong>26-M-7520 / 7520</strong></div>
                    </div>
                    
                    <div class="patient-box">
                        <div class="patient-grid">
                            <div><span>Paciente:</span> JIMENEZ DEL TORO JOSE ANTONIO</div>
                            <div><span>Nro. de Vale:</span> 63504027</div>
                            <div><span>Fecha de Recepción:</span> 2026-06-11 11:06</div>
                            <div><span>Material:</span> BIOPSIA (RIÑON)</div>
                        </div>
                    </div>
                    
                    <div class="report-section">
                        <div class="section-title">Inmunohistoquímica</div>
                        <div class="section-content">${ihqText}</div>
                    </div>
                    
                    <div class="report-section">
                        <div class="section-title">Microscopía</div>
                        <div class="section-content">${microText}</div>
                    </div>
                    
                    <div class="report-section">
                        <div class="section-title">Diagnóstico</div>
                        <div class="section-content">${diagText || '<i>Sin diagnóstico definitivo registrado</i>'}</div>
                    </div>
                    
                    <div class="report-section">
                        <div class="section-title">Observaciones</div>
                        <div class="section-content">${obsText}</div>
                    </div>
                    
                    <div style="font-size: 12px; margin-top: 20px; color: #555;">
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
                <script>window.onload = function() { window.print(); window.close(); }</script>
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
    const selectEstadoProtocolo = document.getElementById('select-estado-protocolo');
    
    btnSaveChanges.addEventListener('click', () => {
        // Update modal summary with selected state
        modalSummaryEstado.textContent = selectEstadoProtocolo.options[selectEstadoProtocolo.selectedIndex].text;
        
        // Open Modal
        saveModal.classList.add('active');
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
            
            // Update grid values
            const gridRow = document.querySelector('.interactive-row');
            const statusCell = gridRow.querySelector('.badge-status-micro');
            
            statusCell.textContent = selectEstadoProtocolo.options[selectEstadoProtocolo.selectedIndex].text;
            
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

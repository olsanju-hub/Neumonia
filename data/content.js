const SLIDE_CODES = Object.freeze([
  "001",
  "002",
  "003",
  "004",
  "005",
  "006",
  "007",
  "008",
  "009",
  "010",
  "011",
  "012",
  "013",
  "014",
  "015",
  "016"
]);

const SLIDES = Object.freeze(
  SLIDE_CODES.map((code, index) =>
    Object.freeze({
      number: index + 1,
      code,
      imagePath: `assets/imagen/nac/${code}.png`,
      textPath: `assets/texto/nac/${code}.txt`,
      imageExists: true,
      textExists: true
    })
  )
);

window.NAC_DATA = Object.freeze({
  appName: "Neumonía Adquirida en la Comunidad (NAC)",
  author: "Guillermo J. Olivero Sanjuanelo",
  assets: Object.freeze({
    cover: "assets/portada/cover.png",
    coverPlaceholder: "assets/ui/cover-placeholder.svg",
    slidePlaceholder: "assets/ui/slide-placeholder.svg"
  }),
  slides: SLIDES,
  slideScan: Object.freeze({
    maxIndex: 180,
    stopAfterMisses: 8
  }),
  bibliography: Object.freeze({
    pran: "PRAN.pdf",
    huseCap: "Neumonía HUSE.pdf",
    huseResp: "Inf respiratorias HUSE.pdf",
    nice: "Neumonia NICE.pdf",
    pcrProtocol: "1- Protocolo test rápido PCR en infecciones respiratorias.pdf",
    utdOverview: "Descripción general de la neumonía adquirida en la comunidad en adultos - UpToDate.pdf",
    utdDx: "Evaluación clínica y pruebas de diagnóstico para la neumonía adquirida en la comunidad en adultos - UpToDate.pdf",
    utdAmb: "Tratamiento de la neumonía adquirida en la comunidad en adultos en el entorno ambulatorio - UpToDate.pdf",
    utdHosp: "Tratamiento de la neumonía adquirida en la comunidad en adultos que requieren hospitalización - UpToDate.pdf"
  }),
  sessionOutline: Object.freeze([
    "NAC",
    "Concepto y Epidemiología",
    "Patogenia",
    "Etiología Microbiológica",
    "Orientación Etiológica",
    "Dx Clínico y Rx",
    "Pruebas complementarias",
    "Estratificación de riesgo",
    "Escala PES",
    "Tratamiento Ambulatorio",
    "Tratamiento UHD",
    "Tratamiento Hospitalario",
    "Duración del TTO",
    "Prevención",
    "Bibliografía",
    "Cierre"
  ]),
  panels: Object.freeze({
    dx: Object.freeze({
      kicker: "Diagnóstico",
      title: "Dx",
      intro:
        "Orden docente priorizado: definición, epidemiología, etiología, diagnóstico clínico, pruebas, radiología, microbiología, red flags, matices y PCR rápida en AP.",
      summary: Object.freeze([
        "La sospecha clínica necesita contexto radiológico cuando la disponibilidad lo permite.",
        "Ningún signo aislado confirma o descarta NAC con fiabilidad; hay que sumar clínica, constantes y evolución.",
        "La microbiología no es rutinaria en NAC leve; escala con gravedad, sepsis o riesgo etiológico concreto.",
        "La PCR rápida solo entra tras valoración clínica y nunca anula signos de gravedad."
      ]),
      sections: Object.freeze([
        Object.freeze({
          title: "Definición e introducción",
          open: true,
          bullets: Object.freeze([
            "La NAC en adultos inmunocompetentes se entiende como infección aguda del parénquima pulmonar adquirida fuera del hospital.",
            "La combinación práctica de cuadro respiratorio compatible e infiltrado en imagen suele bastar para iniciar el diagnóstico de trabajo.",
            "La app está orientada a docencia clínica general; inmunodeprimidos y contextos especiales deben valorarse con protocolos específicos."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Descripción general de la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Epidemiología",
          bullets: Object.freeze([
            "PRAN la describe como causa frecuente de morbimortalidad en población general.",
            "La carga clínica crece con edad avanzada, comorbilidad y fragilidad.",
            "La fracción vírica y las coinfecciones se detectan más que antes por la expansión de pruebas moleculares respiratorias."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Descripción general de la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Orientación etiológica",
          bullets: Object.freeze([
            "S. pneumoniae sigue siendo el referente etiológico principal; también orientan H. influenzae, Mycoplasma, Chlamydophila, Legionella y virus respiratorios.",
            "PRAN recuerda que en un 40-60 % no se aísla patógeno incluso con estudio.",
            "Los rasgos clínicos sugieren, pero no cierran, etiología: tos seca, artromialgias o diarrea pueden apuntar a virus o patógenos atípicos."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Descripción general de la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Diagnóstico clínico",
          bullets: Object.freeze([
            "Síntomas guía: tos, fiebre, disnea, expectoración y dolor pleurítico; en mayores puede presentarse como confusión o descompensación basal.",
            "UpToDate y HUSE coinciden en que ningún signo o combinación simple predice NAC con fiabilidad suficiente.",
            "La valoración inicial obligada incluye temperatura, frecuencia cardiaca, tensión arterial, frecuencia respiratoria, saturación de oxígeno y nivel de consciencia."
          ]),
          citations: Object.freeze(["Neumonía HUSE.pdf", "Evaluación clínica y pruebas de diagnóstico para la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Pruebas complementarias",
          bullets: Object.freeze([
            "En sospecha clínica o radiológica: hemograma, bioquímica, glucosa, sodio, potasio, urea y creatinina.",
            "Gasometría arterial si preocupa el intercambio gaseoso o el equilibrio ácido-base.",
            "HUSE sitúa la procalcitonina como apoyo para desescalar o acortar tratamiento en pacientes estables, no para decidir el inicio del antibiótico.",
            "La PCR sérica aislada ayuda menos que la PCT para distinguir neumonía bacteriana."
          ]),
          citations: Object.freeze(["Neumonía HUSE.pdf", "Neumonia NICE.pdf"])
        }),
        Object.freeze({
          title: "Radiología",
          bullets: Object.freeze([
            "Toda sospecha clínica razonable debe llevar a radiografía de tórax.",
            "Si la radiografía inicial es negativa pero la sospecha persiste, HUSE recomienda repetirla a las 24-48 horas y UpToDate plantea TC en casos seleccionados.",
            "La ecografía pulmonar es útil cuando la radiografía es difícil o de mala calidad, especialmente en pacientes inestables y con experiencia disponible."
          ]),
          citations: Object.freeze(["Neumonía HUSE.pdf", "Neumonia NICE.pdf", "Evaluación clínica y pruebas de diagnóstico para la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Microbiología si aplica",
          bullets: Object.freeze([
            "PRAN no indica estudios microbiológicos en NAC leve de Atención Primaria.",
            "En moderada-alta gravedad o si existe sepsis/riesgo específico: hemocultivos, esputo, antígeno urinario de neumococo, antígeno urinario de Legionella y pruebas virales según temporada.",
            "Si hay derrame pleural accesible, debe estudiarse el líquido pleural."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Neumonia NICE.pdf", "Evaluación clínica y pruebas de diagnóstico para la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Red flags",
          bullets: Object.freeze([
            "PAS <90 mmHg o PAD <=60 mmHg, frecuencia respiratoria >30 rpm, hipoxemia, alteración del nivel de conciencia.",
            "Radiología extensa: afectación bilateral, más de 2 lóbulos, cavitación o derrame pleural.",
            "Imposibilidad de vía oral, falta de soporte sociofamiliar, fracaso terapéutico o progresión radiológica.",
            "Criterios ATS/IDSA de gravedad: 1 criterio mayor o >=3 menores obliga a pensar en UCI/UCRI."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Neumonia NICE.pdf"])
        }),
        Object.freeze({
          title: "Diferenciales y matices",
          bullets: Object.freeze([
            "Mantener diagnóstico diferencial con edema pulmonar, EPOC/asma, atelectasia, aspiración, tromboembolismo pulmonar, tuberculosis o neoplasia.",
            "UpToDate insiste en revisar diagnósticos alternativos si la presentación es atípica o los infiltrados se resuelven con rapidez.",
            "El juicio clínico sigue mandando cuando la imagen y la evolución no encajan con la primera hipótesis."
          ]),
          citations: Object.freeze(["Evaluación clínica y pruebas de diagnóstico para la neumonía adquirida en la comunidad en adultos - UpToDate.pdf", "Descripción general de la neumonía adquirida en la comunidad en adultos - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Papel de la PCR rápida en AP",
          bullets: Object.freeze([
            "Se usa solo si, tras la valoración clínica inicial, persiste duda razonable sobre iniciar antibiótico.",
            "Puntos de corte operativos de la app: <20 mg/L no favorece antibiótico de rutina; 20-100 mg/L abre reevaluación o prescripción diferida; >100 mg/L apoya antibiótico inmediato.",
            "La recomendación final debe reescribirse si hay hipoxemia, hipotensión, confusión, FR alta o mala tolerancia oral: la gravedad pesa más que una PCR baja."
          ]),
          citations: Object.freeze(["PRAN.pdf", "1- Protocolo test rápido PCR en infecciones respiratorias.pdf", "Neumonia NICE.pdf"])
        })
      ])
    }),
    tx: Object.freeze({
      kicker: "Tratamiento",
      title: "Tx",
      intro:
        "Jerarquía aplicada: HUSE y PRAN como base operativa; NICE y UpToDate como apoyo de contraste. Cuando una pauta requiere un protocolo hospitalario más específico, se marca como pendiente.",
      summary: Object.freeze([
        "Tratamiento empírico y precoz, ajustado al lugar de atención y al perfil del paciente.",
        "La app distingue manejo ambulatorio, planta y escenarios graves/UCI sin automatizar coberturas especiales de amplio espectro.",
        "La reevaluación clínica precoz forma parte del tratamiento, no del seguimiento tardío.",
        "Prevención se mantiene dentro del mismo panel porque cierra la sesión terapéutica."
      ]),
      sections: Object.freeze([
        Object.freeze({
          title: "Manejo ambulatorio",
          open: true,
          bullets: Object.freeze([
            "PRAN: <65 años sin enfermedad crónica: amoxicilina VO 1 g cada 8 h durante 5 días.",
            "PRAN: >65 años o comorbilidad: amoxicilina/clavulánico VO 875/125 mg cada 8 h o 2 g/125 mg cada 12 h durante 5 días.",
            "PRAN: sospecha de microorganismos atípicos: azitromicina VO 500 mg cada 24 h durante 3 días.",
            "HUSE para domicilio: amoxicilina 1 g cada 8 h o amoxicilina/clavulánico 875/125 mg cada 8 h; si alergia a betalactámicos, levofloxacino 500 mg cada 24 h; duración a individualizar 5-7 días.",
            "NICE apoya amoxicilina 500 mg cada 8 h durante 5 días en NAC leve y reserva doxiciclina o claritromicina como alternativas si alergia o amoxicilina no es adecuada."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Neumonia NICE.pdf", "Tratamiento de la neumonía adquirida en la comunidad en adultos en el entorno ambulatorio - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Manejo hospitalario",
          bullets: Object.freeze([
            "HUSE planta sin factores de riesgo mayores para P. aeruginosa o SARM: amoxicilina/clavulánico IV 1 g cada 8 h + azitromicina 500 mg cada 24 h; alternativa levofloxacino IV 500 mg cada 24 h.",
            "HUSE UCRI/UCI sin factores de riesgo mayores: ceftriaxona IV 2 g cada 24 h + azitromicina IV 500 mg cada 24 h; alergia a betalactámicos: levofloxacino + aztreonam.",
            "NICE: antibiótico dentro de las 4 horas de la sospecha clínica o de la llegada al hospital; usar vía oral primero si es viable y revisar IV a las 48 horas para cambiar a VO cuando sea posible.",
            "Si hay riesgo mayor de SARM o P. aeruginosa, HUSE escala cobertura y recomienda desescalada según microbiología."
          ]),
          citations: Object.freeze(["Neumonía HUSE.pdf", "Neumonia NICE.pdf", "Tratamiento de la neumonía adquirida en la comunidad en adultos que requieren hospitalización - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Alternativas y cautelas",
          bullets: Object.freeze([
            "NICE: doxiciclina, claritromicina o eritromicina son alternativas válidas en escenarios leves-moderados seleccionados.",
            "Las fluoroquinolonas quedan como recurso condicionado: PRAN y NICE recuerdan efectos adversos importantes y necesidad de uso prudente.",
            "UpToDate respalda beta-lactámico + macrólido o doxiciclina para cubrir atípicos en perfiles con comorbilidad o mayor gravedad."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonia NICE.pdf", "Tratamiento de la neumonía adquirida en la comunidad en adultos en el entorno ambulatorio - UpToDate.pdf", "Tratamiento de la neumonía adquirida en la comunidad en adultos que requieren hospitalización - UpToDate.pdf"])
        }),
        Object.freeze({
          title: "Criterios prácticos AP vs Urgencias",
          bullets: Object.freeze([
            "PRAN: CRB-65 = 0 orienta a manejo ambulatorio; CRB-65 = 1 obliga a valoración hospitalaria; CRB-65 >=2 orienta a ingreso.",
            "Derivar si hay hipotensión, FR >30, hipoxemia, bajo nivel de conciencia, radiología extensa, intolerancia oral, mal soporte social o fracaso terapéutico.",
            "HUSE recuerda que incluso PSI I-III puede requerir ingreso si hay derrame pleural, necesidad de oxígeno, comorbilidad descompensada o mala red de cuidados."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Neumonia NICE.pdf"])
        }),
        Object.freeze({
          title: "Duración y reevaluación",
          bullets: Object.freeze([
            "PRAN plantea 5 días en la mayoría de pautas ambulatorias y reevaluación en 48-72 horas.",
            "HUSE individualiza: 5-7 días en domicilio o planta sin patógenos PES/SARM; 7-14 días en enfermedad grave o con patógenos de riesgo.",
            "HUSE usa como cierre habitual haber completado el mínimo de antibiótico, 48 horas sin fiebre y menos de un signo de inestabilidad clínica.",
            "NICE recomienda detener antibiótico a los 5 días salvo microbiología o inestabilidad clínica que justifique prolongarlo."
          ]),
          citations: Object.freeze(["PRAN.pdf", "Neumonía HUSE.pdf", "Neumonia NICE.pdf"])
        }),
        Object.freeze({
          title: "Prevención",
          bullets: Object.freeze([
            "Abandono del hábito tabáquico.",
            "Vacunación antineumocócica en adultos con edad o riesgo que lo justifique.",
            "Vacunación antigripal anual, especialmente en mayores de 65 años, comorbilidad, inmunosupresión, embarazo, institucionalización o personal sanitario."
          ]),
          citations: Object.freeze(["Neumonía HUSE.pdf"])
        }),
        Object.freeze({
          title: "Qué falta",
          bullets: Object.freeze([
            "Coberturas detalladas automatizadas para P. aeruginosa, SARM y otros patógenos multirresistentes no se programan en esta versión por depender del protocolo local exacto, microbiología y contexto hospitalario.",
            "No se ha convertido a reglas automáticas la desescalada microbiológica fina ni la terapia de aspiración compleja.",
            "Cuando un esquema no está cerrado por la bibliografía disponible en el repositorio, la app lo deja como PENDIENTE DE BIBLIOGRAFÍA."
          ]),
          citations: Object.freeze(["Neumonía HUSE.pdf", "PRAN.pdf", "Tratamiento de la neumonía adquirida en la comunidad en adultos que requieren hospitalización - UpToDate.pdf"])
        })
      ])
    }),
    session: Object.freeze({
      kicker: "Sesión docente",
      title: "Sesión",
      intro: "Índice, acceso directo a diapositivas y bibliografía.",
      summary: Object.freeze([])
    }),
    scales: Object.freeze({
      kicker: "Escalas y apoyo",
      title: "Escalas",
      intro:
        "Las calculadoras son interpretadores docentes: calculan, explican el significado y sugieren el siguiente paso práctico. Nunca sustituyen juicio clínico, red flags ni protocolo local."
    })
  })
});

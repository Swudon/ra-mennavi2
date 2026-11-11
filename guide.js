// 手順の中に「選んだメニューの手順」を差し込む印
const SELECTED = "__SELECTED__";

const GUIDE = {
  1: {
    name: "とみ田",
    // ユーザーが選ぶ項目
    choices: [
      {
        id: "menu",
        type: "radio",
        label: "食べたいメニュー",
        options: [
          { value: "tsukemen", label: "つけ麺", steps: ["券売機で「つけ麺」のボタンを押す"] },
          { value: "ramen",   label: "ラーメン", steps: ["券売機で「ラーメン」のボタンを押す"] }
        ]
      },
      {
        id: "extra",
        type: "checkbox",
        label: "追加したいもの",
        options: [
          { value: "egg",   label: "味玉",  steps: ["味玉のボタンも一緒に押す"] },
          { value: "large", label: "大盛り", steps: ["大盛りのボタンがあれば一緒に押す"] }
        ]
      }
    ],
    // 順番に表示する手順（SELECTED の位置に選んだ項目の手順が入る）
    phases: [
      {
        title: "① 入店前",
        steps: [
          "行列の最後尾に並ぶ",
          "店頭の表示で支払い方法（現金のみかどうか）を確認しておく"
        ]
      },
      {
        title: "② 食券を買う",
        steps: [
          "券売機の前に進む",
          SELECTED,
          "表示された金額を確認して食券を購入する",
          "食券を取り忘れないようにする"
        ]
      },
      {
        title: "③ 席に着く",
        steps: [
          "食券を店員に渡す（カウンターに置く）",
          "案内された席に座る",
          "麺の硬さや味の濃さを聞かれたら答える（聞かれなければそのまま）"
        ]
      },
      {
        title: "④ 食べる",
        steps: [
          "スープや麺の食べ方は自由。周りの人の迷惑にならないよう静かに食べる",
          "食べ終わったら器を所定の場所に戻す（店のルールに従う）"
        ]
      },
      {
        title: "⑤ 退店",
        steps: [
          "店員に「ごちそうさまでした」と声をかける",
          "席を立つときは椅子を戻し、荷物を忘れないようにする",
          "入口付近の邪魔にならないところで会計や出口の案内を確認する"
        ]
      }
    ]
  }
};

// 指定したidのガイドを mount の中に描画する
function renderGuide(storeId, mount) {
  const data = GUIDE[storeId];
  if (!data) {
    mount.innerHTML = "<p>この店舗のガイドはまだ準備中です。</p>";
    return;
  }

  const form = document.createElement("form");
  form.className = "guide-form";

  data.choices.forEach(choice => {
    const fs = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = choice.label;
    fs.appendChild(legend);

    choice.options.forEach((opt, i) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = choice.type;
      input.name = choice.id;
      input.value = opt.value;
      // ラジオボタンは最初の項目を初期選択にする
      if (choice.type === "radio" && i === 0) input.checked = true;
      label.append(input, " " + opt.label);
      fs.appendChild(label);
    });
    form.appendChild(fs);
  });

  const out = document.createElement("div");
  out.className = "guide-result";
  mount.replaceChildren(form, out);

  const update = () => {
    // 選ばれた項目の手順を集める
    const selectedSteps = [];
    data.choices.forEach(choice => {
      const checked = [...form.querySelectorAll(`input[name="${choice.id}"]:checked`)]
        .map(input => input.value);
      choice.options
        .filter(opt => checked.includes(opt.value))
        .forEach(opt => selectedSteps.push(...opt.steps));
    });

    // 手順を描画する
    out.innerHTML = "";
    data.phases.forEach(phase => {
      const h = document.createElement("h3");
      h.textContent = phase.title;
      const ol = document.createElement("ol");
      phase.steps
        .flatMap(step => (step === SELECTED ? selectedSteps : [step]))
        .forEach(text => {
          const li = document.createElement("li");
          li.textContent = text;
          ol.appendChild(li);
        });
      out.append(h, ol);
    });
  };

  form.addEventListener("change", update);
  update();
}

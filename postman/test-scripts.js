// Postman Test Scripts for Mail de Calen API

// 1. レスポンス時間のテスト
pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

// 2. ステータスコードのテスト
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// 3. レスポンスヘッダーのテスト
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// 4. レスポンスボディのテスト
pm.test("Response body is not empty", function () {
    pm.expect(pm.response.text()).to.not.be.empty;
});

// 5. 認証エラーのテスト
pm.test("No authentication error", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.not.have.property("detail");
    pm.expect(responseJson).to.not.include("Invalid authentication token");
});

// 6. 成功レスポンスのテスト
pm.test("Response indicates success", function () {
    const responseJson = pm.response.json();
    if (responseJson.hasOwnProperty("success")) {
        pm.expect(responseJson.success).to.be.true;
    }
});

// 7. エラーハンドリングのテスト
pm.test("No server errors", function () {
    pm.expect(pm.response.code).to.not.be.oneOf([500, 502, 503, 504]);
});

// 8. レスポンス構造のテスト（APIエンドポイント別）
if (pm.info.requestName.includes("Get Events") || pm.info.requestName.includes("Get Todos")) {
    pm.test("Response has data array", function () {
        const responseJson = pm.response.json();
        pm.expect(responseJson).to.have.property("data");
        pm.expect(responseJson.data).to.be.an("array");
    });
}

if (pm.info.requestName.includes("Create") || pm.info.requestName.includes("Update")) {
    pm.test("Response has created/updated item", function () {
        const responseJson = pm.response.json();
        pm.expect(responseJson).to.have.property("id");
    });
}

// 9. 環境変数の自動設定
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    
    // 作成されたアイテムのIDを環境変数に保存
    if (responseJson.id) {
        if (pm.info.requestName.includes("Event")) {
            pm.environment.set("event_id", responseJson.id);
        } else if (pm.info.requestName.includes("Todo")) {
            pm.environment.set("todo_id", responseJson.id);
        }
    }
    
    // 候補IDを環境変数に保存
    if (responseJson.candidates && responseJson.candidates.length > 0) {
        if (pm.info.requestName.includes("Event Candidates")) {
            pm.environment.set("event_candidate_id", responseJson.candidates[0].id);
        } else if (pm.info.requestName.includes("Todo Candidates")) {
            pm.environment.set("todo_candidate_id", responseJson.candidates[0].id);
        }
    }
}

// 10. ログ出力
console.log("Request:", pm.info.requestName);
console.log("Response Time:", pm.response.responseTime + "ms");
console.log("Status Code:", pm.response.code);
console.log("Response Body:", pm.response.text());

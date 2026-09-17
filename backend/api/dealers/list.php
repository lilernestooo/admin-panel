<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';

requireAdmin($pdo);

try {
    $stmt = $pdo->query("
        SELECT rec_id, dealerid, dealername, daily_svrappt, dlrCalendar,
               ch_activated, dealercode, assigned_ga, assigned_soamed,
               bm_address, brandid, crm2_group_Lvl1, vieworder, dealergroup,
               host_name, websites, crm_address, img_file, lvsms_dealername,
               vtiger_dealername, sales_no, trunk_no, fax_no, cs_appnt,
               service_no, crm_no, active_dealer, date_closed, crm3_group_Lvl1,
               dealer_street, dealer_city, dealer_facade, responseTime,
               servis2code, ch_tbl_name, eric6_api, festtype, FB_Ad_DealerID,
               cc_assignment
        FROM tbl_dealership
        ORDER BY rec_id DESC
        LIMIT 500
    ");
    $dealers = $stmt->fetchAll();

    echo json_encode(["success" => true, "data" => $dealers]);
} catch (PDOException $e) {
    error_log("List dealers error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}
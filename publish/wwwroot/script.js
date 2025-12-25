
//Data gönderip alabilmek için SOMEE API
const API_URL = "/api";

//Bölüm göster-gizle fonksiyonu
function bolumGoster(selector) {
    $("section.kullaniciGirisi, section.kullaniciTanimlama, section.kullaniciListeleme").addClass("d-none");
    $(selector).removeClass("d-none");
}

//Sayfa Açıldığında İlk Durum
$(function () {
    girisOncesiDurum();
});

//Giriş Yapma İşlemi
$("#girisButton").on("click", function() {
    const kullaniciAdi = $("#girisKullaniciAdi").val();
    const sifre = $("#girisSifre").val();

    if (!kullaniciAdi || !sifre) {
        uyariModal("Lütfen kullanıcı adı ve şifre girin!");
        return;
    }

    $("#girisButton").prop("disabled", true).text("Kontrol Ediliyor...");

    $.ajax({
        url: API_URL + "/Auth/login",
        method: "POST",
        contentType: "application/json",
        // Sunucudan gelen veriyi otomatik çevirme, biz bakacağız:
        dataType: "text", 
        data: JSON.stringify({ 
            kullaniciAdi: kullaniciAdi, 
            sifre: sifre 
        }),
        success: function (hamCevap) {
            // Ekrana sunucudan gelen her şeyi basalım
            alert("Sunucudan Gelen Cevap: " + hamCevap);
            console.log("Sunucu Cevabı:", hamCevap);

            try {
                // Gelen yazıyı Nesneye çevirmeyi deneyelim
                var jsonCevap = JSON.parse(hamCevap);
                
                // Token'ı yakalamaya çalışalım (Küçük/Büyük harf farketmeksizin)
                var token = jsonCevap.token || jsonCevap.Token || jsonCevap.jwt;

                if (token) {
                    localStorage.setItem("jwtToken", token);
                    alert("Token Başarıyla Kaydedildi!\nToken: " + token.substring(0, 10) + "...");
                    
                    uyariModal("Giriş başarılı! Hoş geldin " + (jsonCevap.adSoyad || jsonCevap.AdSoyad));
                    girisSonrasiDurum();
                    bolumGoster(".kullaniciTanimlama");
                } else {
                    alert("HATA: Cevap geldi ama içinde 'token' bulunamadı!");
                }
            } catch (e) {
                alert("HATA: Sunucudan gelen cevap JSON formatında değil!\nHata: " + e);
            }
        },
        error: function (xhr) {
            $("#girisButton").prop("disabled", false).html('<i class="fa-solid fa-arrow-right-to-bracket"></i> Giriş Yap');
            alert("Giriş Başarısız! Hata Kodu: " + xhr.status + "\n" + xhr.responseText);
        }
    });
});


//Çıkış Yapma İşlemi
$("#menuButtonCikis").click(function(){
    localStorage.removeItem("jwtToken");
    uyariModal("Çıkış Yapıldı!");
    girisOncesiDurum();
    bolumGoster(".kullaniciGirisi");
});

//Menü Kontrolü
$("#menuButtonGiris").click(function(){
    bolumGoster(".kullaniciGirisi");
});

$("#menuButtonTanimlama").click(function(){
    if (!localStorage.getItem("jwtToken")) {
        uyariModal("Lütfen önce giriş yapın!");
        return;
    }
    bolumGoster(".kullaniciTanimlama");
});

$("#menuButtonListeleme").click(function(){
    if (!localStorage.getItem("jwtToken")) {
        uyariModal("Lütfen önce giriş yapın!");
        return;
    }
    bolumGoster(".kullaniciListeleme");
    kullaniciListele();
});

//Giriş ve Çıkıştan sonra sayfanın yapısı
function girisOncesiDurum() {
    $("#menuButtonCikis").addClass("d-none");
    $("#menuButtonGiris").prop("disabled", false);
    $("#girisKullaniciAdi").val("");
    $("#girisSifre").val("");
    $("#girisButton").prop("disabled", false).html('<i class="fa-solid fa-arrow-right-to-bracket"></i> Giriş Yap');
}
function girisSonrasiDurum() {
    $("#menuButtonCikis").removeClass("d-none");
    $(".kullaniciGirisi").addClass("d-none");
    $("#menuButtonTanimlama, #menuButtonListeleme").prop("disabled", false);
    $("#menuButtonGiris").prop("disabled", true);
    
}


//dataları kullanıcı tablosuna çekmek için kullanılan fonksiyon - GET
function kullaniciListele(){
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        $("#menuButtonCikis").click();
        return;
    }

    $.ajax({
        url: API_URL + "/Users/", 
        method: "GET",
        headers: { "Authorization": "Bearer " + token }, 
        success: function(cevap) {
            $("#kullaniciListesi tbody").empty();
            cevap.forEach(function(kisi) {
                const row = `
                    <tr>
                        <td>${kisi.id}</td>
                        <td>${kisi.kullaniciAdi}</td>
                        <td>***</td> 
                        <td>${kisi.adSoyad}</td>
                        <td>${kisi.email}</td>
                        <td>${kisi.birim}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-warning duzenleButton" data-id="${kisi.id}"><i class="fa-solid fa-gear"></i> Düzenle</button>
                        </td>
                    </tr>`;
                $("#kullaniciListesi tbody").append(row);
            });
        },
        error: function(xhr) {
            
             if(xhr.status === 401) {
                 localStorage.removeItem("jwtToken");
                 uyariModal("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
                 $("#menuButtonCikis").click();
             } else {
                 uyariModal("Liste çekilemedi! Hata Kodu: " + xhr.status);
             }
        }
    });
}


//dataları api ile göndermek için kullanılan fonksiyon - POST
$("#kaydetButton").click(function() {
    let yeniKullanici = {
        kullaniciAdi: $("#kullaniciAdi").val(),
        sifre: ($("#sifre").val()),
        adSoyad: $("#adSoyad").val(),
        email: $("#email").val(),
        birim: $("#birim").val()
    };

    if (!yeniKullanici.kullaniciAdi || !yeniKullanici.sifre || !yeniKullanici.adSoyad || !yeniKullanici.email || !yeniKullanici.birim) {
        uyariModal ("Bilgilerin tamamlanması zorunludur!");
        return;
    }

    $.ajax({
        url: API_URL + "/Users/",
        method: "POST",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + localStorage.getItem("jwtToken")},
        data: JSON.stringify(yeniKullanici),
        success: function() {
            uyariModal("Kullanıcı kaydedildi!");
            kullaniciListele();
            //Kullanıcı ekledikten sonra inputları temizleme
            $("#kullaniciAdi").val("");
            $("#adSoyad").val("");
            $("#email").val("");
            $("#birim").val("");
            $("#sifre").val("");
            
        },
        error: function () {
            uyariModal("Kullanıcı kaydedilemedi!");
        }
    });
});

//Düzenle butonuna tıklandığında modal açma işlemi
$(document).on("click",".duzenleButton", function(){
    const id = $(this).data("id");
    $.ajax({
        url: API_URL + "/Users/" + id,
        method: "GET",
        headers: {"Authorization": "Bearer " + localStorage.getItem("jwtToken")},
        success: function(kisi){
        $("#modalKullaniciId").val(kisi.id);
        $("#modalKullaniciAdi").val(kisi.kullaniciAdi);
        $("#modalSifre").val(kisi.sifre);
        $("#modalAdSoyad").val(kisi.adSoyad);
        $("#modalEmail").val(kisi.email);
        $("#modalBirim").val(kisi.birim);
        
        const modal = new bootstrap.Modal(document.getElementById('kullaniciModal'));
        modal.show();
        }
    });
});

//Yapılan düzenlemeyi kaydetme işlemi
$("#guncelleButton").click(function(){
    const id = $("#modalKullaniciId").val();
    const guncel = {
        id: parseInt(id), 
        kullaniciAdi: $("#modalKullaniciAdi").val(),
        sifre: $("#modalSifre").val(),
        adSoyad: $("#modalAdSoyad").val(),
        email: $("#modalEmail").val(),
        birim: $("#modalBirim").val()
    };
    $.ajax({
        url: API_URL + "/Users/" + id,
        method: "PUT",
        contentType: "application/json",
        headers: {"Authorization": "Bearer " + localStorage.getItem("jwtToken")},
        data: JSON.stringify(guncel),
        success: function(){
            uyariModal("Kullanıcı güncellendi!");
            $("#kullaniciModal").modal("hide");
            kullaniciListele();
        }
    });
});;

//Kullanıcıyı silme işlemi
$("#silButton").click(function(){
    const id = $("#modalKullaniciId").val();
    
    $("#onayModalMesaj").text("Bu kullanıcıyı silmek istediğinize emin misiniz ?");
    $("#onayModalEvet").on("click", function(){
        
        $("#onayModal").modal("hide");

        $.ajax({
            url: API_URL + "/Users/" + id,    
            method: "DELETE",
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwtToken") },
            success: function(){
                uyariModal("Kullanıcı silindi!");
                $("#kullaniciModal").modal("hide");
                kullaniciListele();
            }
        });
    });
    $("#onayModal").modal("show");
});

//Uyarı yapılacak zaman açılacak modal
function uyariModal (mesaj) {
    $('.uyariModal .modal-body p').text(mesaj);
    var modal = new bootstrap.Modal(document.querySelector('.uyariModal .modal'));
    modal.show();
}
